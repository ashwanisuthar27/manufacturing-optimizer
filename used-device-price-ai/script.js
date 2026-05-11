/**
 * script.js — Core logic for Used Device Price AI
 * Handles: Price estimation, comparison, recommendations, UI interactions
 */

// ═══════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════
let currentTheme = 'dark';
let lastEstimation = null;
let radarChart = null;

// ═══════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavigation();
    initEstimatorForm();
    initCompareSection();
    initProcessorSection();
    initRecommendationSection();
    initMobileMenu();
    populateDropdowns();
});

// ═══════════════════════════════════════════════
// THEME
// ═══════════════════════════════════════════════
function initTheme() {
    const saved = localStorage.getItem('theme') || 'dark';
    setTheme(saved);
    document.getElementById('themeToggle')?.addEventListener('click', () => {
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
}

function setTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    const icon = document.getElementById('themeIcon');
    if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// ═══════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════
function initNavigation() {
    document.querySelectorAll('[data-nav]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('data-nav');
            navigateTo(target);
        });
    });
}

function navigateTo(sectionId) {
    // Update active nav
    document.querySelectorAll('[data-nav]').forEach(l => l.classList.remove('active'));
    document.querySelectorAll(`[data-nav="${sectionId}"]`).forEach(l => l.classList.add('active'));

    // Show/hide sections
    document.querySelectorAll('.page-section').forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none';
    });
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'block';
        requestAnimationFrame(() => section.classList.add('active'));
    }

    // Close mobile sidebar
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('overlay')?.classList.remove('show');
}

function initMobileMenu() {
    document.getElementById('menuBtn')?.addEventListener('click', () => {
        document.getElementById('sidebar')?.classList.toggle('open');
        document.getElementById('overlay')?.classList.toggle('show');
    });
    document.getElementById('overlay')?.addEventListener('click', () => {
        document.getElementById('sidebar')?.classList.remove('open');
        document.getElementById('overlay')?.classList.remove('show');
    });
}

function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]));
}

function normalizeText(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function addOptions(select, values, placeholder) {
    select.innerHTML = '';
    select.appendChild(new Option(placeholder, ''));
    values.forEach(value => select.appendChild(new Option(value, value)));
}

function getMergedSeriesMap(brand) {
    const base = DEVICE_HIERARCHY[brand] || {};
    const upcoming = (typeof UPCOMING_MODEL_HINTS !== 'undefined' && UPCOMING_MODEL_HINTS[brand]) || {};
    const merged = {};

    [...Object.keys(base), ...Object.keys(upcoming)].forEach(series => {
        merged[series] = [...new Set([...(base[series] || []), ...(upcoming[series] || [])])];
    });

    return merged;
}

function getDeviceCatalog() {
    return Object.entries(DEVICE_SPECS).map(([name, spec]) => ({ name, ...spec }));
}

function getSeriesModels(brand, series) {
    return getMergedSeriesMap(brand)[series] || [];
}

function findKnownSpec(model, brand) {
    const target = normalizeText(model);
    if (!target) return null;

    const match = getDeviceCatalog().find(device => {
        const deviceName = normalizeText(device.name);
        const sameBrand = !brand || normalizeText(device.brand) === normalizeText(brand);
        return sameBrand && (deviceName === target || deviceName.includes(target) || target.includes(deviceName));
    });

    return match || null;
}

function getSeriesDevices(brand, series) {
    const seriesNames = getSeriesModels(brand, series).map(normalizeText);
    const looseSeries = normalizeText(series).replace(/\bseries\b/g, '').trim();
    const familyTokens = getSeriesFamilyTokens(brand, series);

    return getDeviceCatalog().filter(device => {
        if (normalizeText(device.brand) !== normalizeText(brand)) return false;
        const deviceName = normalizeText(device.name);
        return seriesNames.some(name => name && (deviceName.includes(name) || name.includes(deviceName))) ||
            familyTokens.some(token => deviceName.includes(token)) ||
            (looseSeries && deviceName.includes(looseSeries));
    });
}

function getSeriesFamilyTokens(brand, series) {
    const text = normalizeText(`${brand} ${series}`);
    if (text.includes('iphone')) return ['iphone'];
    if (text.includes('galaxy s')) return ['galaxy s'];
    if (text.includes('galaxy z')) return ['galaxy z'];
    if (text.includes('galaxy a')) return ['galaxy a'];
    if (text.includes('pixel')) return ['pixel'];
    if (text.includes('oneplus number')) return ['oneplus 1', 'oneplus 2', 'oneplus 3', 'oneplus 4', 'oneplus 5', 'oneplus 6', 'oneplus 7', 'oneplus 8', 'oneplus 9'];
    if (text.includes('nord')) return ['nord'];
    if (text.includes('find x')) return ['find x'];
    if (text.includes('reno')) return ['reno'];
    if (text.includes('vivo x')) return ['vivo x'];
    if (text.includes('redmi note')) return ['redmi note'];
    if (text.includes('poco f')) return ['poco f'];
    if (text.includes('edge')) return ['edge'];
    return [];
}

// ═══════════════════════════════════════════════
// FORM POPULATION
// ═══════════════════════════════════════════════
function populateDropdowns() {
    const deviceType = document.getElementById('deviceType');
    if (deviceType) {
        deviceType.addEventListener('change', onDeviceTypeChange);
        onDeviceTypeChange();
    }
}

function onDeviceTypeChange() {
    const type = document.getElementById('deviceType').value;
    const brandSel = document.getElementById('brand');
    const procSel = document.getElementById('processor');
    const ramSel = document.getElementById('ram');
    const storageSel = document.getElementById('storage');
    const batterySel = document.getElementById('battery');
    const seriesSel = document.getElementById('series');
    const modelSel = document.getElementById('model');
    const customModelGroup = document.getElementById('customModelGroup');
    const customModelInput = document.getElementById('customModel');
    const newModelNote = document.getElementById('newModelNote');

    addOptions(brandSel, BRANDS[type] || [], 'Select Brand');
    addOptions(procSel, PROCESSORS[type] || [], 'Select Processor');
    addOptions(ramSel, RAM_OPTIONS[type] || [], 'Select RAM');
    addOptions(storageSel, STORAGE_OPTIONS[type] || [], 'Select Storage');
    addOptions(batterySel, BATTERY_OPTIONS[type] || [], 'Select Battery');

    [...ramSel.options].forEach(option => {
        if (option.value) option.textContent = `${option.value} GB`;
    });
    [...storageSel.options].forEach(option => {
        if (!option.value) return;
        const value = Number(option.value);
        option.textContent = value >= 1024 ? `${value / 1024} TB` : `${value} GB`;
    });
    [...batterySel.options].forEach(option => {
        if (option.value) option.textContent = type === 'laptop' ? `${option.value} Wh` : `${option.value} mAh`;
    });

    // Brand change → populate series
    brandSel.onchange = () => {
        const brand = brandSel.value;
        addOptions(seriesSel, Object.keys(getMergedSeriesMap(brand)), 'Select Series');
        addOptions(modelSel, [], 'Select Series first');
        toggleNewModelMode(false);
    };

    // Series change → populate models
    seriesSel.onchange = () => {
        const brand = brandSel.value;
        const series = seriesSel.value;
        const models = brand && series ? getSeriesModels(brand, series) : [];
        addOptions(modelSel, [...models, 'Other / New Model'], 'Select Model');
        toggleNewModelMode(false);
    };

    // Model change → show/hide custom input
    modelSel.onchange = () => {
        toggleNewModelMode(modelSel.value === 'Other / New Model');
    };

    function toggleNewModelMode(isNew) {
        customModelGroup.style.display = isNew ? 'flex' : 'none';
        customModelGroup.classList.toggle('is-active', isNew);
        newModelNote.style.display = isNew ? 'block' : 'none';
        customModelInput.required = isNew;
        ['ram', 'storage', 'processor', 'battery', 'age', 'launchYear', 'condition'].forEach(id => {
            document.getElementById(id)?.closest('.form-group')?.classList.toggle('is-new-focus', isNew);
        });
        if (isNew) setTimeout(() => customModelInput.focus(), 100);
    };
}

// ═══════════════════════════════════════════════
// ESTIMATOR FORM
// ═══════════════════════════════════════════════
function initEstimatorForm() {
    document.getElementById('estimateForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        runEstimation();
    });
}

function runEstimation() {
    let modelValue = document.getElementById('model').value;
    const isNewModel = modelValue === 'Other / New Model';
    if (isNewModel) {
        modelValue = document.getElementById('customModel').value.trim() || 'Unknown Model';
    }

    const formData = {
        deviceType: document.getElementById('deviceType').value,
        brand: document.getElementById('brand').value,
        series: document.getElementById('series').value,
        model: modelValue,
        isNewModel: isNewModel,
        ram: parseFloat(document.getElementById('ram').value),
        storage: parseFloat(document.getElementById('storage').value),
        age: parseFloat(document.getElementById('age').value),
        launchYear: parseFloat(document.getElementById('launchYear').value),
        condition: document.getElementById('condition').value,
        processor: document.getElementById('processor').value,
        battery: parseFloat(document.getElementById('battery').value)
    };

    // Validate
    if (!formData.brand || !formData.series || !formData.model || !formData.ram || !formData.storage || isNaN(formData.age)) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    // Show loading
    const resultDiv = document.getElementById('estimationResult');
    const btn = document.getElementById('estimateBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Estimating...';
    resultDiv.style.display = 'none';

    // Simulate async processing
    setTimeout(() => {
        const result = predictPrice(formData);
        lastEstimation = { ...formData, ...result };
        displayResult(result, formData);
        showRecommendations(result.estimatedPrice, formData);
        btn.disabled = false;
        btn.innerHTML = '<span class="btn-icon">⚡</span> Estimate Price';
    }, 1200);
}

/**
 * Core price estimation logic
 * TODO: Replace with actual XGBoost model call via Python backend (price_estimator_xgb.pkl)
 * Current implementation uses a heuristic formula based on analysis of cleaned_used_devices.csv
 */
function estimatePrice(data) {
    // 1. Determine base new price
    let newPrice = getBaseNewPrice(data);

    // 2. Depreciation based on age
    const retention = BRAND_RETENTION[data.brand] || 0.90;
    const monthlyDepRate = 0.025 * (2 - retention);
    let depreciation;
    if (data.age <= 12) {
        depreciation = data.age * monthlyDepRate;
    } else {
        depreciation = (12 * monthlyDepRate) + ((data.age - 12) * monthlyDepRate * 0.7);
    }
    depreciation = Math.min(depreciation, 0.85);

    // 3. Condition multiplier
    const condMultiplier = {
        'Excellent': 1.05,
        'Good': 0.95,
        'Fair': 0.82,
        'Poor': 0.65
    }[data.condition] || 0.95;

    // 4. Calculate used price
    let usedPrice = newPrice * (1 - depreciation) * condMultiplier;
    usedPrice = Math.max(1000, Math.round(usedPrice / 100) * 100);

    // 5. Price range
    const low = Math.round(usedPrice * 0.9 / 100) * 100;
    const high = Math.round(usedPrice * 1.1 / 100) * 100;

    // 6. Worth buying verdict
    const valueScore = (usedPrice / newPrice) * 100;
    let verdict, verdictClass, reasoning;
    if (valueScore < 40) {
        verdict = '🟢 Great Deal!';
        verdictClass = 'great';
        reasoning = `At ${valueScore.toFixed(0)}% of the original price, this is an excellent value. The device still offers strong specs for the money.`;
    } else if (valueScore < 55) {
        verdict = '🟡 Fair Price';
        verdictClass = 'fair';
        reasoning = `At ${valueScore.toFixed(0)}% of the original price, this is a reasonable deal. Consider negotiating slightly lower for better value.`;
    } else if (valueScore < 70) {
        verdict = '🟠 Slightly Overpriced';
        verdictClass = 'overpriced';
        reasoning = `At ${valueScore.toFixed(0)}% of the original price, the seller might be asking too much. Try to negotiate or consider newer alternatives.`;
    } else {
        verdict = '🔴 Not Worth It';
        verdictClass = 'bad';
        reasoning = `At ${valueScore.toFixed(0)}% of the original price, buying new would be a better choice. The price-to-value ratio is too high.`;
    }

    return {
        estimatedPrice: usedPrice,
        newPrice,
        priceRange: { low, high },
        depreciation: (depreciation * 100).toFixed(1),
        verdict,
        verdictClass,
        reasoning,
        valueScore: valueScore.toFixed(1)
    };
}

function getBaseNewPrice(data) {
    let base = 15000;

    // 1. Try exact match from DEVICE_SPECS
    if (!data.isNewModel) {
        const specKey = Object.keys(DEVICE_SPECS).find(k =>
            k.toLowerCase().includes(data.model.toLowerCase()) ||
            data.model.toLowerCase().includes(k.toLowerCase().replace(data.brand.toLowerCase(), '').trim())
        );
        if (specKey) return DEVICE_SPECS[specKey].price;
    }

    // 2. Intelligent Series-Based Prediction for Unknown/New Devices
    if (data.isNewModel && data.brand && data.series && DEVICE_HIERARCHY[data.brand][data.series]) {
        const seriesModels = DEVICE_HIERARCHY[data.brand][data.series];
        let totalSeriesPrice = 0;
        let seriesCount = 0;

        // Find average price of known models in the same series
        seriesModels.forEach(m => {
            const matchKey = Object.keys(DEVICE_SPECS).find(k => k.toLowerCase().includes(m.toLowerCase()));
            if (matchKey) {
                totalSeriesPrice += DEVICE_SPECS[matchKey].price;
                seriesCount++;
            }
        });

        if (seriesCount > 0) {
            base = totalSeriesPrice / seriesCount;
            // Add a slight premium for new models in a series (typically newer gen costs more)
            base *= 1.1; 
        } else {
            // Fallback base by brand tier if series data missing
            base = data.deviceType === 'laptop' ? 50000 : 25000;
        }
    } else {
        // Fallback Heuristic
        const ram = data.ram || 4;
        const storage = data.storage || 64;
        if (data.deviceType === 'laptop') {
            base = 40000 + (ram * 800) + (storage * 15);
        } else {
            base = 8000 + (ram * 1200) + (storage * 25);
        }
    }

    // Apply adjustments based on user's manual specs
    // This helps bump the price if they enter high RAM/Storage for a new model
    const extraRam = Math.max(0, (data.ram || 8) - 8);
    const extraStorage = Math.max(0, (data.storage || 128) - 128);
    
    if (data.deviceType === 'laptop') {
        base += (extraRam * 600) + (extraStorage * 12);
    } else {
        base += (extraRam * 800) + (extraStorage * 15);
    }

    // Brand premium (always applied for fallback or adjusted predictions)
    if (data.isNewModel || !Object.keys(DEVICE_SPECS).some(k => k.toLowerCase().includes(data.model.toLowerCase()))) {
        const premiums = {
            'Apple': 1.6, 'Samsung': 1.3, 'Google': 1.2, 'OnePlus': 1.15,
            'Xiaomi': 1.0, 'Vivo': 1.05, 'Dell': 1.3, 'HP': 1.2, 'Microsoft': 1.4
        };
        base *= premiums[data.brand] || 1.0;

        // Processor tier bonus
        const proc = (data.processor || '').toLowerCase();
        if (proc.includes('elite') || proc.includes('a19') || proc.includes('m4') || proc.includes('9500')) base *= 1.4;
        else if (proc.includes('gen 3') || proc.includes('a18') || proc.includes('m3') || proc.includes('tensor g5')) base *= 1.25;
        else if (proc.includes('gen 2') || proc.includes('a17') || proc.includes('m2') || proc.includes('8400')) base *= 1.15;
    }

    return Math.round(base / 100) * 100;
}

/**
 * Robust zero-shot price prediction.
 *
 * Future backend integration:
 * - POST this payload to `/api/predict-price`.
 * - Backend should load price_estimator_xgb.pkl + label_encoder.pkl.
 * - Keep this JS path as the fallback for devices outside the trained model.
 */
function predictPrice(data) {
    const knownSpec = !data.isNewModel ? findKnownSpec(data.model, data.brand) : null;
    const seriesDevices = getSeriesDevices(data.brand, data.series);
    const basis = buildPredictionBasis(data, knownSpec, seriesDevices);
    const newPrice = Math.max(1000, Math.round(basis.adjustedNewPrice / 100) * 100);
    const depreciation = calculateDepreciation(data);
    const conditionMultiplier = {
        'Excellent': 1.05,
        'Good': 0.95,
        'Fair': 0.82,
        'Poor': 0.65
    }[data.condition] || 0.95;
    const usedPrice = Math.max(1000, Math.round((newPrice * (1 - depreciation) * conditionMultiplier) / 100) * 100);
    const confidence = calculateConfidence(data, knownSpec, seriesDevices);
    const valueScore = (usedPrice / newPrice) * 100;
    const verdictData = buildVerdict(valueScore);

    return {
        estimatedPrice: usedPrice,
        newPrice,
        priceRange: {
            low: Math.round(usedPrice * (confidence >= 85 ? 0.92 : 0.86) / 100) * 100,
            high: Math.round(usedPrice * (confidence >= 85 ? 1.08 : 1.16) / 100) * 100
        },
        depreciation: (depreciation * 100).toFixed(1),
        valueScore: valueScore.toFixed(1),
        confidence,
        isKnownModel: Boolean(knownSpec),
        seriesDeviceCount: seriesDevices.length,
        basisMessage: basis.message,
        sourceType: knownSpec ? 'known' : (seriesDevices.length ? 'series' : 'fallback'),
        ...verdictData
    };
}

function buildPredictionBasis(data, knownSpec, seriesDevices) {
    if (knownSpec) {
        return {
            adjustedNewPrice: adjustForManualSpecs(knownSpec.price, knownSpec, data),
            message: 'Exact model found in the local device specs dataset.'
        };
    }

    const profile = buildSeriesProfile(data, seriesDevices);
    const base = adjustForManualSpecs(profile.price, profile, data);
    return {
        adjustedNewPrice: base * getGenerationPremium(data) * getProcessorMultiplier(data.processor) * getBrandTierMultiplier(data.brand, data.deviceType),
        message: seriesDevices.length
            ? `This is a new model. Price estimated using similar ${data.series} devices.`
            : `This model is outside the local dataset. Price estimated using ${data.brand} brand tier and entered specs.`
    };
}

function buildSeriesProfile(data, seriesDevices) {
    if (!seriesDevices.length) {
        return {
            price: data.deviceType === 'laptop' ? 55000 : getBrandDefaultPrice(data.brand),
            ram: data.deviceType === 'laptop' ? 16 : 8,
            storage: data.deviceType === 'laptop' ? 512 : 128,
            battery: data.deviceType === 'laptop' ? 60 : 4500
        };
    }

    const avg = field => seriesDevices.reduce((sum, device) => sum + (Number(device[field]) || 0), 0) / seriesDevices.length;
    return {
        price: avg('price'),
        ram: avg('ram') || 8,
        storage: avg('storage') || 128,
        battery: avg('battery') || 4500
    };
}

function adjustForManualSpecs(basePrice, referenceSpec, data) {
    const ramDelta = (Number(data.ram) || referenceSpec.ram || 8) - (referenceSpec.ram || 8);
    const storageDelta = (Number(data.storage) || referenceSpec.storage || 128) - (referenceSpec.storage || 128);
    const batteryDelta = (Number(data.battery) || referenceSpec.battery || 4500) - (referenceSpec.battery || 4500);
    const ramValue = data.deviceType === 'laptop' ? 900 : 1200;
    const storageValue = data.deviceType === 'laptop' ? 18 : 20;
    const batteryValue = data.deviceType === 'laptop' ? 180 : 1.2;
    return basePrice + (ramDelta * ramValue) + (storageDelta * storageValue) + (batteryDelta * batteryValue);
}

function calculateDepreciation(data) {
    const retention = BRAND_RETENTION[data.brand] || (data.deviceType === 'laptop' ? 0.84 : 0.80);
    const monthlyDepRate = 0.025 * (2 - retention);
    const age = Math.max(0, Number(data.age) || 0);
    const depreciation = age <= 12
        ? age * monthlyDepRate
        : (12 * monthlyDepRate) + ((age - 12) * monthlyDepRate * 0.7);
    return Math.min(depreciation, 0.85);
}

function calculateConfidence(data, knownSpec, seriesDevices) {
    if (knownSpec) return 94;
    if (seriesDevices.length >= 3) return 78;
    if (seriesDevices.length >= 1) return 68;
    return data.processor && data.ram && data.storage ? 58 : 48;
}

function buildVerdict(valueScore) {
    if (valueScore < 40) {
        return { verdict: 'Great Deal', verdictClass: 'great', reasoning: `At ${valueScore.toFixed(0)}% of the estimated new price, this is strong used-market value.` };
    }
    if (valueScore < 55) {
        return { verdict: 'Fair Price', verdictClass: 'fair', reasoning: `At ${valueScore.toFixed(0)}% of the estimated new price, this is a reasonable deal.` };
    }
    if (valueScore < 70) {
        return { verdict: 'Slightly Overpriced', verdictClass: 'overpriced', reasoning: `At ${valueScore.toFixed(0)}% of the estimated new price, try negotiating lower.` };
    }
    return { verdict: 'Not Worth It', verdictClass: 'bad', reasoning: `At ${valueScore.toFixed(0)}% of the estimated new price, buying new or waiting for resale supply may be better.` };
}

function getGenerationPremium(data) {
    const year = Number(data.launchYear);
    if (!year) return data.isNewModel ? 1.05 : 1;
    const currentYear = new Date().getFullYear();
    if (year > currentYear) return 1.12;
    if (year === currentYear) return 1.06;
    return Math.max(0.92, 1 - ((currentYear - year) * 0.03));
}

function getProcessorMultiplier(processor) {
    const proc = normalizeText(processor);
    if (!proc) return 1;
    if (proc.includes('a19') || proc.includes('8 elite gen 2') || proc.includes('dimensity 9500') || proc.includes('tensor g6')) return 1.22;
    if (proc.includes('a18') || proc.includes('8 elite') || proc.includes('dimensity 9400') || proc.includes('tensor g5')) return 1.16;
    if (proc.includes('a17') || proc.includes('8 gen 3') || proc.includes('dimensity 9300') || proc.includes('tensor g4')) return 1.10;
    if (proc.includes('7') || proc.includes('8300') || proc.includes('exynos')) return 1.04;
    return 1;
}

function getBrandTierMultiplier(brand, deviceType) {
    const phonePremiums = {
        'Apple': 1.18, 'Samsung': 1.10, 'Google': 1.08, 'OnePlus': 1.04,
        'Vivo': 1.02, 'OPPO': 1.02, 'Nothing': 1.02, 'Xiaomi': 1.00,
        'iQOO': 0.98, 'Realme': 0.96, 'Motorola': 0.94, 'POCO': 0.92,
        'Infinix': 0.82, 'Tecno': 0.82
    };
    const laptopPremiums = {
        'Apple': 1.22, 'Microsoft': 1.10, 'Dell': 1.08, 'HP': 1.04,
        'Lenovo': 1.02, 'Asus': 1.02, 'MSI': 1.00, 'Acer': 0.94
    };
    return (deviceType === 'laptop' ? laptopPremiums : phonePremiums)[brand] || 1;
}

function getBrandDefaultPrice(brand) {
    const defaults = {
        'Apple': 89900, 'Samsung': 74999, 'Google': 69999, 'OnePlus': 54999,
        'Vivo': 42999, 'OPPO': 39999, 'Xiaomi': 34999, 'Nothing': 34999,
        'iQOO': 32999, 'Realme': 28999, 'POCO': 24999, 'Motorola': 24999,
        'Infinix': 15999, 'Tecno': 14999
    };
    return defaults[brand] || 24999;
}

function displayResult(result, formData) {
    const resultDiv = document.getElementById('estimationResult');
    
    // Confidence and Badge logic
    const isNew = !result.isKnownModel;
    const badgeText = isNew ? '✨ New Model - Series Estimated' : '✓ Known Model';
    const badgeColor = isNew ? 'var(--accent)' : 'var(--green)';
    const confidenceScore = `${result.confidence}%`;
    const confidenceText = escapeHTML(result.basisMessage);
    const safeBrand = escapeHTML(formData.brand);
    const safeModel = escapeHTML(formData.model);
    const safeCondition = escapeHTML(formData.condition);
    const safeProcessor = escapeHTML(formData.processor || 'Processor not specified');

    resultDiv.innerHTML = `
        <div class="result-card animate-in">
            <div class="result-header">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                    <div class="result-device">
                        <span class="device-icon">${formData.deviceType === 'phone' ? '📱' : '💻'}</span>
                        <div>
                            <h3>${safeBrand} ${safeModel}</h3>
                            <p class="specs-line">${formData.ram}GB RAM · ${formData.storage >= 1024 ? (formData.storage / 1024) + 'TB' : formData.storage + 'GB'} · ${formData.age} months old · ${formData.condition}</p>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <span style="display: inline-block; padding: 4px 10px; background: ${badgeColor}20; color: ${badgeColor}; border: 1px solid ${badgeColor}40; border-radius: 8px; font-size: 12px; font-weight: 600;">${badgeText}</span>
                        <div style="font-size: 12px; color: var(--text-muted); margin-top: 6px;">Confidence: <strong>${confidenceScore}</strong></div>
                    </div>
                </div>
                ${isNew ? `<div style="font-size: 13px; color: var(--text-secondary); background: var(--bg-tertiary); padding: 10px; border-radius: 8px; border-left: 3px solid var(--accent); margin-top: 10px;">${confidenceText}</div>` : ''}
            </div>

            <div class="price-display">
                <div class="price-label">Estimated Used Price</div>
                <div class="price-amount">₹${result.estimatedPrice.toLocaleString('en-IN')}</div>
                <div class="price-range">Range: ₹${result.priceRange.low.toLocaleString('en-IN')} – ₹${result.priceRange.high.toLocaleString('en-IN')}</div>
            </div>

            <div class="price-stats">
                <div class="stat">
                    <span class="stat-label">New Price</span>
                    <span class="stat-value">₹${result.newPrice.toLocaleString('en-IN')}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Depreciation</span>
                    <span class="stat-value">${result.depreciation}%</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Value Retention</span>
                    <span class="stat-value">${(100 - parseFloat(result.depreciation)).toFixed(1)}%</span>
                </div>
            </div>

            <div class="verdict-box ${result.verdictClass}">
                <div class="verdict-title">${result.verdict}</div>
                <p class="verdict-text">${result.reasoning}</p>
            </div>

            <div class="buy-links">
                <h4>Check Prices On</h4>
                <div class="buy-links-grid">
                    <a href="https://www.amazon.in/s?k=${encodeURIComponent(formData.brand + ' ' + formData.model)}" target="_blank" rel="noopener" class="buy-link amazon">
                        <span>Amazon.in</span><span class="arrow">→</span>
                    </a>
                    <a href="https://www.flipkart.com/search?q=${encodeURIComponent(formData.brand + ' ' + formData.model)}" target="_blank" rel="noopener" class="buy-link flipkart">
                        <span>Flipkart</span><span class="arrow">→</span>
                    </a>
                    <a href="https://www.cashify.in/sell-old-${formData.deviceType === 'phone' ? 'mobile-phone' : 'laptop'}" target="_blank" rel="noopener" class="buy-link cashify">
                        <span>Cashify</span><span class="arrow">→</span>
                    </a>
                    <a href="https://www.olx.in/items/q-${encodeURIComponent(formData.brand + ' ' + formData.model)}" target="_blank" rel="noopener" class="buy-link olx">
                        <span>OLX</span><span class="arrow">→</span>
                    </a>
                </div>
            </div>
        </div>
    `;
    resultDiv.style.display = 'block';
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ═══════════════════════════════════════════════
// RECOMMENDATIONS
// ═══════════════════════════════════════════════
function showRecommendations(targetPrice, formData) {
    const recsContainer = document.getElementById('recommendationsGrid');
    if (!recsContainer) return;

    const range = targetPrice * 0.45;
    const sameSeries = getSeriesDevices(formData.brand, formData.series);
    const allDevices = getDeviceCatalog();
    const similar = allDevices
        .map(device => ({
            ...device,
            seriesBoost: sameSeries.some(seriesDevice => seriesDevice.name === device.name) ? 0 : 1,
            priceDistance: Math.abs(device.price * 0.6 - targetPrice)
        }))
        .filter(device => device.seriesBoost === 0 || device.priceDistance < range)
        .sort((a, b) => (a.seriesBoost - b.seriesBoost) || (a.priceDistance - b.priceDistance))
        .slice(0, 6);

    if (similar.length === 0) {
        recsContainer.innerHTML = '<p class="empty-state">No similar devices found in this price range.</p>';
        return;
    }

    recsContainer.innerHTML = similar.map(d => `
        <div class="rec-card">
            <div class="rec-img">${d.brand === 'Apple' ? '🍎' : '📱'}</div>
            <div class="rec-info">
                <h4>${d.name}</h4>
                <p class="rec-specs">${d.ram}GB · ${d.storage >= 1024 ? (d.storage / 1024) + 'TB' : d.storage + 'GB'} · ${d.battery}mAh</p>
                <p class="rec-proc">${d.processor}</p>
                <div class="rec-prices">
                    <span class="rec-new">New: ₹${d.price.toLocaleString('en-IN')}</span>
                    <span class="rec-used">Used: ~₹${Math.round(d.price * 0.6 / 100 * 100).toLocaleString('en-IN')}</span>
                </div>
            </div>
            <a href="https://www.amazon.in/s?k=${encodeURIComponent(d.name)}" target="_blank" rel="noopener" class="rec-btn">View Details →</a>
        </div>
    `).join('');

    document.getElementById('recommendationsSection').style.display = 'block';
}

// ═══════════════════════════════════════════════
// COMPARE DEVICES
// ═══════════════════════════════════════════════
function initCompareSection() {
    // Build a combined brand list from DEVICE_HIERARCHY
    const allBrands = Object.keys(DEVICE_HIERARCHY).sort();

    ['1', '2'].forEach(idx => {
        const brandSel = document.getElementById(`compareBrand${idx}`);
        const seriesSel = document.getElementById(`compareSeries${idx}`);
        const modelSel = document.getElementById(`compareDevice${idx}`);
        if (!brandSel || !seriesSel || !modelSel) return;

        // Populate brands
        brandSel.innerHTML = '<option value="">Select Brand</option>';
        allBrands.forEach(b => {
            brandSel.innerHTML += `<option value="${b}">${b}</option>`;
        });

        // Brand → Series
        brandSel.addEventListener('change', () => {
            const brand = brandSel.value;
            seriesSel.innerHTML = '<option value="">Select Series</option>';
            modelSel.innerHTML = '<option value="">Select Series first</option>';
            if (brand && DEVICE_HIERARCHY[brand]) {
                Object.keys(DEVICE_HIERARCHY[brand]).forEach(s => {
                    seriesSel.innerHTML += `<option value="${s}">${s}</option>`;
                });
            }
        });

        // Series → Models
        seriesSel.addEventListener('change', () => {
            const brand = brandSel.value;
            const series = seriesSel.value;
            modelSel.innerHTML = '<option value="">Select Model</option>';
            if (brand && series && DEVICE_HIERARCHY[brand] && DEVICE_HIERARCHY[brand][series]) {
                DEVICE_HIERARCHY[brand][series].forEach(m => {
                    // Try: exact key, brand+model, or partial match
                    const fullName = `${brand} ${m}`;
                    const specKey = Object.keys(DEVICE_SPECS).find(k =>
                        k === m || k === fullName ||
                        k.toLowerCase() === m.toLowerCase() ||
                        k.toLowerCase() === fullName.toLowerCase() ||
                        k.toLowerCase().includes(m.toLowerCase())
                    );
                    const val = specKey || fullName;
                    const label = specKey || m;
                    const badge = specKey ? '' : ' ⚠️';
                    modelSel.innerHTML += `<option value="${val}">${label}${badge}</option>`;
                });
            }
        });
    });

    document.getElementById('compareBtn')?.addEventListener('click', runComparison);
}

function runComparison() {
    const d1 = document.getElementById('compareDevice1').value;
    const d2 = document.getElementById('compareDevice2').value;

    if (!d1 || !d2) {
        showToast('Please select both devices to compare', 'error');
        return;
    }
    if (d1 === d2) {
        showToast('Please select two different devices', 'error');
        return;
    }

    const spec1 = DEVICE_SPECS[d1];
    const spec2 = DEVICE_SPECS[d2];
    if (!spec1 || !spec2) {
        showToast('Device specs not found', 'error');
        return;
    }

    displayComparisonTable(d1, spec1, d2, spec2);
    drawRadarChart(d1, spec1, d2, spec2);

    document.getElementById('comparisonResult').style.display = 'block';
    document.getElementById('comparisonResult').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function displayComparisonTable(name1, s1, name2, s2) {
    const tbody = document.getElementById('compareTableBody');
    if (!tbody) return;

    const rows = [
        ['Brand', s1.brand, s2.brand],
        ['Price (New)', `₹${s1.price.toLocaleString('en-IN')}`, `₹${s2.price.toLocaleString('en-IN')}`],
        ['Used Price (est.)', `₹${Math.round(s1.price * 0.6 / 100 * 100).toLocaleString('en-IN')}`, `₹${Math.round(s2.price * 0.6 / 100 * 100).toLocaleString('en-IN')}`],
        ['RAM', `${s1.ram} GB`, `${s2.ram} GB`],
        ['Storage', `${s1.storage} GB`, `${s2.storage} GB`],
        ['Battery', `${s1.battery} mAh`, `${s2.battery} mAh`],
        ['Camera', s1.camera, s2.camera],
        ['Display', s1.display, s2.display],
        ['Processor', s1.processor, s2.processor],
        ['Performance', `${s1.scores.performance}/10`, `${s2.scores.performance}/10`],
        ['Value Score', `${s1.scores.value}/10`, `${s2.scores.value}/10`]
    ];

    tbody.innerHTML = rows.map(([label, v1, v2]) => `
        <tr>
            <td class="compare-label">${label}</td>
            <td class="compare-val">${v1}</td>
            <td class="compare-val">${v2}</td>
        </tr>
    `).join('');

    document.getElementById('compareName1').textContent = name1;
    document.getElementById('compareName2').textContent = name2;
}

function drawRadarChart(name1, s1, name2, s2) {
    const ctx = document.getElementById('radarChart')?.getContext('2d');
    if (!ctx) return;

    if (radarChart) radarChart.destroy();

    const labels = ['Performance', 'Camera', 'Battery', 'Display', 'Storage', 'Value'];
    const keys = ['performance', 'camera', 'battery', 'display', 'storage', 'value'];

    radarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels,
            datasets: [
                {
                    label: name1,
                    data: keys.map(k => s1.scores[k]),
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    borderColor: 'rgba(59, 130, 246, 0.8)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                    pointRadius: 4
                },
                {
                    label: name2,
                    data: keys.map(k => s2.scores[k]),
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    borderColor: 'rgba(16, 185, 129, 0.8)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(16, 185, 129, 1)',
                    pointRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 10,
                    ticks: {
                        stepSize: 2,
                        color: currentTheme === 'dark' ? '#94a3b8' : '#64748b',
                        backdropColor: 'transparent',
                        font: { size: 11 }
                    },
                    grid: {
                        color: currentTheme === 'dark' ? 'rgba(148,163,184,0.12)' : 'rgba(100,116,139,0.15)'
                    },
                    angleLines: {
                        color: currentTheme === 'dark' ? 'rgba(148,163,184,0.12)' : 'rgba(100,116,139,0.15)'
                    },
                    pointLabels: {
                        color: currentTheme === 'dark' ? '#cbd5e1' : '#334155',
                        font: { size: 13, weight: '500' }
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: currentTheme === 'dark' ? '#e2e8f0' : '#1e293b',
                        font: { size: 13 },
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                }
            }
        }
    });
}

// ═══════════════════════════════════════════════
// PROCESSOR COMPARE
// ═══════════════════════════════════════════════
function initProcessorSection() {
    const btn = document.getElementById('compareProcBtn');
    if (!btn) return;

    ['1', '2'].forEach(idx => {
        const compSel = document.getElementById(`procCompany${idx}`);
        const seriesSel = document.getElementById(`procSeries${idx}`);
        const modelSel = document.getElementById(`procModel${idx}`);

        if (!compSel || !seriesSel || !modelSel) return;

        // Company change → populate series
        compSel.addEventListener('change', () => {
            const comp = compSel.value;
            seriesSel.innerHTML = '<option value="">Select Series</option>';
            modelSel.innerHTML = '<option value="">Select Series first</option>';
            
            if (comp && PROCESSOR_HIERARCHY[comp]) {
                Object.keys(PROCESSOR_HIERARCHY[comp]).forEach(s => {
                    seriesSel.innerHTML += `<option value="${s}">${s}</option>`;
                });
            }
        });

        // Series change → populate models
        seriesSel.addEventListener('change', () => {
            const comp = compSel.value;
            const series = seriesSel.value;
            modelSel.innerHTML = '<option value="">Select Processor</option>';
            
            if (comp && series && PROCESSOR_HIERARCHY[comp] && PROCESSOR_HIERARCHY[comp][series]) {
                PROCESSOR_HIERARCHY[comp][series].forEach(m => {
                    modelSel.innerHTML += `<option value="${m}">${m}</option>`;
                });
            }
        });
    });

    btn.addEventListener('click', runProcessorComparison);
}

function runProcessorComparison() {
    const comp1 = document.getElementById('procCompany1').value;
    const proc1 = document.getElementById('procModel1').value;
    const comp2 = document.getElementById('procCompany2').value;
    const proc2 = document.getElementById('procModel2').value;

    if (!proc1 || !proc2) {
        showToast('Please select two processors to compare', 'error');
        return;
    }

    const btn = document.getElementById('compareProcBtn');
    const loading = document.getElementById('procLoading');
    const resultDiv = document.getElementById('procComparisonResult');

    btn.disabled = true;
    resultDiv.style.display = 'none';
    loading.style.display = 'block';

    // Simulate scraping NanoReview data
    setTimeout(() => {
        displayProcessorResult(proc1, comp1, proc2, comp2);
        loading.style.display = 'none';
        btn.disabled = false;
        resultDiv.style.display = 'block';
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 1500);
}

function displayProcessorResult(proc1, comp1, proc2, comp2) {
    const tbody = document.getElementById('procCompareTableBody');
    document.getElementById('procCompareName1').textContent = proc1;
    document.getElementById('procCompareName2').textContent = proc2;

    const s1 = PROCESSOR_SPECS[proc1];
    const s2 = PROCESSOR_SPECS[proc2];

    // If a processor isn't in our database, show a message
    if (!s1 || !s2) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:24px; color:var(--text-muted);">
            ${!s1 ? proc1 : proc2} specs not in database yet. Try a different processor.
        </td></tr>`;
        return;
    }

    // Helper: color the higher value green, lower red
    const hi = (a, b, flip) => {
        const aWins = flip ? a < b : a > b;
        const bWins = flip ? b < a : b > a;
        return {
            v1: aWins ? `<span style="color:var(--green);font-weight:700">${typeof a==='number'? a.toLocaleString():a}</span>` : (bWins ? `<span style="color:var(--red)">${typeof a==='number'? a.toLocaleString():a}</span>` : `${typeof a==='number'? a.toLocaleString():a}`),
            v2: bWins ? `<span style="color:var(--green);font-weight:700">${typeof b==='number'? b.toLocaleString():b}</span>` : (aWins ? `<span style="color:var(--red)">${typeof b==='number'? b.toLocaleString():b}</span>` : `${typeof b==='number'? b.toLocaleString():b}`)
        };
    };

    const bar = (score) => `<div style="display:flex;align-items:center;gap:8px;">
        <div style="flex:1;height:6px;background:var(--bg-tertiary);border-radius:3px;overflow:hidden;">
            <div style="width:${score}%;height:100%;background:${score>=80?'var(--green)':score>=60?'var(--yellow)':'var(--red)'};border-radius:3px;"></div>
        </div>
        <span style="font-weight:700;min-width:36px;">${score}/100</span>
    </div>`;

    const at = hi(s1.antutu, s2.antutu);
    const gs = hi(s1.gb_single, s2.gb_single);
    const gm = hi(s1.gb_multi, s2.gb_multi);
    const nc = hi(s1.nano_cpu, s2.nano_cpu);
    const ng = hi(s1.nano_gpu, s2.nano_gpu);
    const nb = hi(s1.nano_battery, s2.nano_battery);

    const rows = [
        ['Company', s1.company, s2.company],
        ['Architecture', s1.arch, s2.arch],
        ['Lithography', s1.nm, s2.nm],
        ['CPU Cores', s1.cores, s2.cores],
        ['Max Clock', s1.clock, s2.clock],
        ['GPU', s1.gpu, s2.gpu],
        ['AnTuTu 10', `~${at.v1}`, `~${at.v2}`],
        ['Geekbench 6 Single', gs.v1, gs.v2],
        ['Geekbench 6 Multi', gm.v1, gm.v2],
        ['CPU Score', bar(s1.nano_cpu), bar(s2.nano_cpu)],
        ['Gaming Score', bar(s1.nano_gpu), bar(s2.nano_gpu)],
        ['Battery Efficiency', bar(s1.nano_battery), bar(s2.nano_battery)]
    ];

    tbody.innerHTML = rows.map(([label, v1, v2]) => `
        <tr>
            <td class="compare-label">${label}</td>
            <td class="compare-val">${v1}</td>
            <td class="compare-val">${v2}</td>
        </tr>
    `).join('');
}

// ═══════════════════════════════════════════════
// SMART RECOMMENDATION ENGINE
// ═══════════════════════════════════════════════
function initRecommendationSection() {
    // Toggle filter buttons (radio-group behavior within each filter box)
    document.querySelectorAll('.filter-options').forEach(group => {
        group.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                group.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    });

    // Main search button
    document.getElementById('findPhoneBtn')?.addEventListener('click', runRecommendation);
}

function getFilterValue(groupId) {
    const group = document.getElementById(groupId);
    if (!group) return null;
    const active = group.querySelector('.filter-btn.active');
    return active ? active.dataset.value : null;
}

function runRecommendation() {
    const filters = {
        price: getFilterValue('filterPrice'),
        camera: getFilterValue('filterCamera'),
        performance: getFilterValue('filterPerformance'),
        size: getFilterValue('filterSize'),
        battery: getFilterValue('filterBattery'),
        charging: getFilterValue('filterCharging')
    };

    const btn = document.getElementById('findPhoneBtn');
    const loading = document.getElementById('recLoading');
    const results = document.getElementById('recResults');

    btn.disabled = true;
    results.style.display = 'none';
    loading.style.display = 'block';

    setTimeout(() => {
        const matched = filterDevices(filters);
        displayRecommendations(matched, filters);
        loading.style.display = 'none';
        btn.disabled = false;
        results.style.display = 'block';
        results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 1200);
}

/**
 * Filter RECOMMENDATION_DB based on user preferences.
 * Mirrors the logic from HI.py get_recommendations().
 */
function filterDevices(filters) {
    let devices = [...RECOMMENDATION_DB];

    // Price filter
    if (filters.price === 'Low') devices = devices.filter(d => d.price < 15000);
    else if (filters.price === 'Mid') devices = devices.filter(d => d.price >= 15000 && d.price < 30000);
    else if (filters.price === 'Value for Money') devices = devices.filter(d => d.price >= 30000 && d.price < 50000);
    else if (filters.price === 'High') devices = devices.filter(d => d.price >= 50000);

    // Camera filter
    if (filters.camera === 'Avg') devices = devices.filter(d => d.camera_mp < 64);
    else if (filters.camera === 'Good') devices = devices.filter(d => d.camera_mp >= 64 && d.camera_mp < 100);
    else if (filters.camera === 'Best') devices = devices.filter(d => d.camera_mp >= 100);

    // Performance filter (based on RAM)
    if (filters.performance === 'Low') devices = devices.filter(d => d.ram <= 4);
    else if (filters.performance === 'Avg') devices = devices.filter(d => d.ram > 4 && d.ram <= 8);
    else if (filters.performance === 'High') devices = devices.filter(d => d.ram > 8);

    // Size filter
    if (filters.size === 'Compact') devices = devices.filter(d => d.display_inch < 6.4);
    else if (filters.size === 'Big') devices = devices.filter(d => d.display_inch >= 6.4);

    // Battery filter
    if (filters.battery === 'Small is good') devices = devices.filter(d => d.battery_mah < 4500);
    else if (filters.battery === 'Last longer') devices = devices.filter(d => d.battery_mah >= 4500);

    // Charging filter
    if (filters.charging === 'Slow') devices = devices.filter(d => d.charging_w < 25);
    else if (filters.charging === 'Medium') devices = devices.filter(d => d.charging_w >= 25 && d.charging_w <= 65);
    else if (filters.charging === 'Fast') devices = devices.filter(d => d.charging_w > 65);

    return devices;
}

function displayRecommendations(devices, filters) {
    const grid = document.getElementById('recResultsGrid');
    const title = document.getElementById('recResultTitle');
    const subtitle = document.getElementById('recResultSubtitle');

    if (devices.length === 0) {
        title.textContent = '😔 No exact matches found';
        subtitle.textContent = 'Try relaxing some of your preferences for more results.';

        // Show closest matches by relaxing filters
        const relaxed = filterDevicesRelaxed(filters);
        if (relaxed.length > 0) {
            subtitle.textContent = 'Here are some close alternatives we found:';
            devices = relaxed;
        } else {
            grid.innerHTML = '<p style="text-align:center; color: var(--text-muted); padding: 32px;">No devices match your criteria at all. Please adjust your filters.</p>';
            return;
        }
    } else {
        title.textContent = `📱 We found ${devices.length} device${devices.length > 1 ? 's' : ''} for you`;
        subtitle.textContent = 'Based on your preferences — sorted by best value';
    }

    // Sort: best value (lowest price with most specs) first
    devices.sort((a, b) => {
        const scoreA = (a.ram * 1000) + a.battery_mah + (a.camera_mp * 10) + a.charging_w - (a.price / 100);
        const scoreB = (b.ram * 1000) + b.battery_mah + (b.camera_mp * 10) + b.charging_w - (b.price / 100);
        return scoreB - scoreA;
    });

    // Show top 5
    const top = devices.slice(0, 5);

    grid.innerHTML = top.map((d, i) => `
        <div class="rec-card">
            <div class="rec-rank">#${i + 1}</div>
            <div class="rec-img">${d.brand === 'Apple' ? '🍎' : '📱'}</div>
            <div class="rec-info">
                <h4>${d.name}</h4>
                <p class="rec-brand">${d.brand}</p>
                <p class="rec-specs">${d.ram}GB RAM · ${d.storage} · ${d.battery_mah}mAh</p>
                <p class="rec-proc">${d.processor}</p>
                <div class="rec-highlights">
                    <span class="rec-tag">📷 ${d.camera_mp}MP</span>
                    <span class="rec-tag">📰 ${d.display_inch}"</span>
                    <span class="rec-tag">⚡ ${d.charging_w}W</span>
                </div>
                <div class="rec-prices">
                    <span class="rec-new">₹${d.price.toLocaleString('en-IN')}</span>
                    <span class="rec-used">Market Price</span>
                </div>
            </div>
            <div class="rec-actions">
                <a href="https://www.amazon.in/s?k=${encodeURIComponent(d.name)}" target="_blank" rel="noopener" class="rec-btn rec-btn-amazon">Amazon →</a>
                <a href="https://www.flipkart.com/search?q=${encodeURIComponent(d.name)}" target="_blank" rel="noopener" class="rec-btn rec-btn-flipkart">Flipkart →</a>
            </div>
        </div>
    `).join('');
}

/**
 * Relaxed filter: only apply price + one other strongest preference.
 * This prevents zero-result scenarios.
 */
function filterDevicesRelaxed(filters) {
    let devices = [...RECOMMENDATION_DB];

    // Always keep price filter
    if (filters.price === 'Low') devices = devices.filter(d => d.price < 15000);
    else if (filters.price === 'Mid') devices = devices.filter(d => d.price >= 15000 && d.price < 30000);
    else if (filters.price === 'Value for Money') devices = devices.filter(d => d.price >= 30000 && d.price < 50000);
    else if (filters.price === 'High') devices = devices.filter(d => d.price >= 50000);

    // Apply only performance filter as secondary
    if (filters.performance === 'High') devices = devices.filter(d => d.ram > 8);
    else if (filters.performance === 'Avg') devices = devices.filter(d => d.ram > 4);

    return devices.slice(0, 5);
}

// ═══════════════════════════════════════════════
// TOAST NOTIFICATIONS
// ═══════════════════════════════════════════════
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
