/**
 * data.js — Core Database for Used Device Price AI
 * 
 * NOTE: This file represents the structured format expected by the frontend.
 * For production, use a Python script (like app.py) to read cleaned_used_devices.csv
 * and device_specs_structured_dataset.csv, then dynamically generate this JSON structure
 * or serve it via a REST API endpoint.
 */

// ──────────────────────────────────────────────
// Brand list
// ──────────────────────────────────────────────
const BRANDS = {
    phone: [
        'Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Vivo', 'OPPO', 'Realme',
        'Google', 'Nothing', 'iQOO', 'POCO', 'Motorola', 'Infinix', 'Tecno'
    ],
    laptop: [
        'Apple', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'MSI', 'Microsoft'
    ]
};

// ──────────────────────────────────────────────
// Smart Device Selection Hierarchy: Brand -> Series -> Models
// (Data derived from cleaned_used_devices.csv structure)
// ──────────────────────────────────────────────
const DEVICE_HIERARCHY = {
    'Apple': {
        'iPhone 17 Series': ['iPhone 17 Pro Max', 'iPhone 17 Pro', 'iPhone 17', 'iPhone 17 Air'],
        'iPhone 16 Series': ['iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16 Plus', 'iPhone 16'],
        'iPhone 15 Series': ['iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15'],
        'iPhone 14 Series': ['iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14 Plus', 'iPhone 14'],
        'iPhone 13 Series': ['iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13', 'iPhone 13 mini'],
        'MacBook Pro': ['MacBook Pro 16" (M4 Max)', 'MacBook Pro 14" (M4 Pro)', 'MacBook Pro 16" (M3 Max)', 'MacBook Pro 14" (M3 Pro)'],
        'MacBook Air': ['MacBook Air 15" (M3)', 'MacBook Air 13" (M2)']
    },
    'Samsung': {
        'Galaxy S Series': ['Galaxy S25 Ultra', 'Galaxy S25+', 'Galaxy S25', 'Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24', 'Galaxy S23 Ultra', 'Galaxy S23 FE'],
        'Galaxy Z Series': ['Galaxy Z Fold7', 'Galaxy Z Flip7', 'Galaxy Z Fold6', 'Galaxy Z Flip6', 'Galaxy Z Fold5', 'Galaxy Z Flip5'],
        'Galaxy A Series': ['Galaxy A56 5G', 'Galaxy A36 5G', 'Galaxy A55 5G', 'Galaxy A35 5G', 'Galaxy A54 5G', 'Galaxy A34 5G'],
        'Galaxy M Series': ['Galaxy M56 5G', 'Galaxy M36 5G', 'Galaxy M55 5G', 'Galaxy M35 5G']
    },
    'OnePlus': {
        'Number Series': ['OnePlus 13', 'OnePlus 13R', 'OnePlus 12', 'OnePlus 12R', 'OnePlus 11 5G', 'OnePlus 11R 5G'],
        'Nord Series': ['OnePlus Nord 5', 'OnePlus Nord 4', 'OnePlus Nord CE 4', 'OnePlus Nord 3 5G'],
        'Open': ['OnePlus Open 2', 'OnePlus Open']
    },
    'Xiaomi': {
        'Number Series': ['Xiaomi 15 Ultra', 'Xiaomi 15 Pro', 'Xiaomi 15', 'Xiaomi 14 Ultra', 'Xiaomi 14', 'Xiaomi 13 Pro'],
        'Redmi Note Series': ['Redmi Note 14 Pro+ 5G', 'Redmi Note 14 Pro 5G', 'Redmi Note 14 5G', 'Redmi Note 13 Pro+ 5G', 'Redmi Note 13 Pro 5G', 'Redmi Note 13 5G'],
        'Redmi Number Series': ['Redmi 14C 5G', 'Redmi 13C 5G', 'Redmi 12 5G']
    },
    'Google': {
        'Pixel 10 Series': ['Pixel 10 Pro XL', 'Pixel 10 Pro', 'Pixel 10', 'Pixel 10 Pro Fold'],
        'Pixel 9 Series': ['Pixel 9 Pro XL', 'Pixel 9 Pro', 'Pixel 9', 'Pixel 9a', 'Pixel 9 Pro Fold'],
        'Pixel 8 Series': ['Pixel 8 Pro', 'Pixel 8', 'Pixel 8a'],
        'Pixel 7 Series': ['Pixel 7 Pro', 'Pixel 7', 'Pixel 7a']
    },
    'Vivo': {
        'X Series': ['Vivo X200 Ultra', 'Vivo X200 Pro', 'Vivo X200', 'Vivo X100 Pro', 'Vivo X100', 'Vivo X90 Pro'],
        'V Series': ['Vivo V40 Pro', 'Vivo V40', 'Vivo V30 Pro', 'Vivo V30', 'Vivo V29'],
        'T Series': ['Vivo T4 5G', 'Vivo T3 5G', 'Vivo T2 Pro']
    },
    'Realme': {
        'Number Series': ['Realme 13 Pro+ 5G', 'Realme 13 Pro 5G', 'Realme 12 Pro+ 5G', 'Realme 12 Pro 5G', 'Realme 12+ 5G'],
        'GT Series': ['Realme GT 7 Pro', 'Realme GT 6', 'Realme GT 6T'],
        'Narzo Series': ['Realme Narzo 70 Pro', 'Realme Narzo 60x']
    },
    'Dell': {
        'XPS Series': ['XPS 16', 'XPS 14', 'XPS 13 Plus'],
        'Inspiron Series': ['Inspiron 16 Plus', 'Inspiron 15', 'Inspiron 14'],
        'Alienware': ['Alienware m18', 'Alienware m16']
    },
    'HP': {
        'Spectre Series': ['Spectre x360 16', 'Spectre x360 14'],
        'Envy Series': ['Envy x360 15', 'Envy 16'],
        'Omen Series': ['Omen 16', 'Omen Transcend 14']
    },
    'OPPO': {
        'Find X Series': ['OPPO Find X8 Pro', 'OPPO Find X8', 'OPPO Find X7 Ultra', 'OPPO Find X7'],
        'Reno Series': ['OPPO Reno 13 Pro', 'OPPO Reno 13', 'OPPO Reno 12 Pro', 'OPPO Reno 12'],
        'F Series': ['OPPO F27 Pro+', 'OPPO F25 Pro']
    },
    'Nothing': {
        'Phone Series': ['Nothing Phone (3)', 'Nothing Phone (2a) Plus', 'Nothing Phone (2a)', 'Nothing Phone (2)'],
        'CMF Series': ['CMF Phone 2 Pro', 'CMF Phone 1']
    },
    'iQOO': {
        'Number Series': ['iQOO 13', 'iQOO 12', 'iQOO 11'],
        'Neo Series': ['iQOO Neo 10', 'iQOO Neo 9 Pro', 'iQOO Neo 7 Pro'],
        'Z Series': ['iQOO Z10', 'iQOO Z9s Pro', 'iQOO Z9']
    },
    'POCO': {
        'F Series': ['POCO F7 Pro', 'POCO F6', 'POCO F5'],
        'X Series': ['POCO X7 Pro', 'POCO X6 Pro', 'POCO X6'],
        'M Series': ['POCO M7 Pro', 'POCO M6 Pro']
    },
    'Motorola': {
        'Edge Series': ['Motorola Edge 60 Pro', 'Motorola Edge 50 Ultra', 'Motorola Edge 50 Pro'],
        'Razr Series': ['Motorola Razr 60 Ultra', 'Motorola Razr 50 Ultra', 'Motorola Razr 50'],
        'G Series': ['Moto G85', 'Moto G64', 'Moto G54']
    },
    'Infinix': {
        'GT Series': ['Infinix GT 30 Pro', 'Infinix GT 20 Pro'],
        'Note Series': ['Infinix Note 50 Pro', 'Infinix Note 40 Pro'],
        'Zero Series': ['Infinix Zero 40', 'Infinix Zero 30']
    },
    'Tecno': {
        'Phantom Series': ['Tecno Phantom V Fold2', 'Tecno Phantom V Flip2', 'Tecno Phantom X2 Pro'],
        'Camon Series': ['Tecno Camon 40 Premier', 'Tecno Camon 30 Premier'],
        'Pova Series': ['Tecno Pova 6 Pro', 'Tecno Pova 5 Pro']
    },
    'Lenovo': {
        'ThinkPad Series': ['ThinkPad X1 Carbon', 'ThinkPad T14', 'ThinkPad E14'],
        'Yoga Series': ['Yoga Slim 7', 'Yoga 9i', 'Yoga Pro 7'],
        'Legion Series': ['Legion 7i', 'Legion 5 Pro', 'Legion Slim 5']
    },
    'Asus': {
        'Zenbook Series': ['Zenbook 14 OLED', 'Zenbook S 16', 'Zenbook Duo'],
        'Vivobook Series': ['Vivobook 16X', 'Vivobook S 15', 'Vivobook Pro 15'],
        'ROG Series': ['ROG Zephyrus G14', 'ROG Strix Scar 16', 'ROG Flow X13']
    },
    'Acer': {
        'Swift Series': ['Swift Go 14', 'Swift X 14', 'Swift Edge 16'],
        'Aspire Series': ['Aspire 7', 'Aspire 5', 'Aspire Vero'],
        'Predator Series': ['Predator Helios Neo 16', 'Predator Helios 18']
    },
    'MSI': {
        'Prestige Series': ['Prestige 16 AI', 'Prestige 14 AI'],
        'Stealth Series': ['Stealth 16 Studio', 'Stealth 14 Studio'],
        'Katana Series': ['Katana 15', 'Katana 17']
    },
    'Microsoft': {
        'Surface Laptop': ['Surface Laptop 7', 'Surface Laptop 6', 'Surface Laptop Studio 2'],
        'Surface Pro': ['Surface Pro 11', 'Surface Pro 10', 'Surface Pro 9']
    }
};

// Upcoming placeholders keep every major brand/series selectable. The estimator
// still treats these as series-based unless a matching DEVICE_SPECS entry exists.
const UPCOMING_MODEL_HINTS = {
    'Apple': {
        'iPhone 18 Series': ['iPhone 18 Pro Max', 'iPhone 18 Pro', 'iPhone 18', 'iPhone 18 Air']
    },
    'Samsung': {
        'Galaxy S Series': ['Galaxy S27 Ultra', 'Galaxy S27+', 'Galaxy S27', 'Galaxy S26 Ultra', 'Galaxy S26+', 'Galaxy S26'],
        'Galaxy Z Series': ['Galaxy Z Fold8', 'Galaxy Z Flip8']
    },
    'OnePlus': {
        'Number Series': ['OnePlus 15', 'OnePlus 15R', 'OnePlus 14', 'OnePlus 14R']
    },
    'Google': {
        'Pixel 11 Series': ['Pixel 11 Pro XL', 'Pixel 11 Pro', 'Pixel 11', 'Pixel 11a']
    },
    'Xiaomi': {
        'Number Series': ['Xiaomi 17 Ultra', 'Xiaomi 17 Pro', 'Xiaomi 17', 'Xiaomi 16 Ultra', 'Xiaomi 16']
    },
    'Vivo': {
        'X Series': ['Vivo X300 Ultra', 'Vivo X300 Pro', 'Vivo X300']
    },
    'OPPO': {
        'Find X Series': ['OPPO Find X10 Pro', 'OPPO Find X10', 'OPPO Find X9 Pro', 'OPPO Find X9']
    },
    'Realme': {
        'GT Series': ['Realme GT 9 Pro', 'Realme GT 8 Pro']
    },
    'Nothing': {
        'Phone Series': ['Nothing Phone (4)', 'Nothing Phone (3a) Pro']
    },
    'iQOO': {
        'Number Series': ['iQOO 15', 'iQOO 14']
    },
    'POCO': {
        'F Series': ['POCO F8 Pro', 'POCO F8']
    },
    'Motorola': {
        'Edge Series': ['Motorola Edge 70 Ultra', 'Motorola Edge 70 Pro']
    }
};

const PROCESSOR_HIERARCHY = {
    'Qualcomm': {
        'Snapdragon 8 Series': ['Snapdragon 8 Elite', 'Snapdragon 8s Gen 3', 'Snapdragon 8 Gen 3', 'Snapdragon 8 Gen 2', 'Snapdragon 8+ Gen 1', 'Snapdragon 8 Gen 1'],
        'Snapdragon 7 Series': ['Snapdragon 7+ Gen 3', 'Snapdragon 7 Gen 3', 'Snapdragon 7s Gen 3', 'Snapdragon 7s Gen 2', 'Snapdragon 7 Gen 1'],
        'Snapdragon 6 Series': ['Snapdragon 6 Gen 3', 'Snapdragon 6 Gen 1', 'Snapdragon 695 5G'],
        'Snapdragon 4 Series': ['Snapdragon 4 Gen 2', 'Snapdragon 4 Gen 1'],
        'Snapdragon X (PC)': ['Snapdragon X Elite', 'Snapdragon X Plus']
    },
    'MediaTek': {
        'Dimensity 9000 Series': ['Dimensity 9400', 'Dimensity 9300+', 'Dimensity 9300', 'Dimensity 9200+', 'Dimensity 9200', 'Dimensity 9000'],
        'Dimensity 8000 Series': ['Dimensity 8300 Ultra', 'Dimensity 8200', 'Dimensity 8100'],
        'Dimensity 7000 Series': ['Dimensity 7300', 'Dimensity 7200 Pro', 'Dimensity 7200 Ultra', 'Dimensity 7050'],
        'Dimensity 6000 Series': ['Dimensity 6300', 'Dimensity 6100+', 'Dimensity 6080'],
        'Helio G Series': ['Helio G99 Ultimate', 'Helio G99', 'Helio G88', 'Helio G85']
    },
    'Apple': {
        'A Series (Mobile)': ['Apple A18 Pro', 'Apple A18', 'Apple A17 Pro', 'Apple A16 Bionic', 'Apple A15 Bionic', 'Apple A14 Bionic'],
        'M Series (Mac/iPad)': ['Apple M4 Max', 'Apple M4 Pro', 'Apple M4', 'Apple M3 Max', 'Apple M3 Pro', 'Apple M3', 'Apple M2', 'Apple M1']
    },
    'Samsung': {
        'Exynos Flagship': ['Exynos 2500', 'Exynos 2400', 'Exynos 2200', 'Exynos 2100'],
        'Exynos Mid-Range': ['Exynos 1480', 'Exynos 1380', 'Exynos 1280']
    },
    'Google': {
        'Tensor Series': ['Google Tensor G4', 'Google Tensor G3', 'Google Tensor G2']
    },
    'Intel': {
        'Core Ultra Series': ['Core Ultra 9 185H', 'Core Ultra 7 155H', 'Core Ultra 5 125H'],
        '14th Gen Core': ['Core i9-14900HX', 'Core i7-14700HX', 'Core i5-14500HX'],
        '13th Gen Core': ['Core i7-13700H', 'Core i5-13500H', 'Core i5-1335U']
    },
    'AMD': {
        'Ryzen 9000/AI Series': ['Ryzen AI 9 HX 370', 'Ryzen 9 8945HS', 'Ryzen 7 8845HS', 'Ryzen 7 8840U'],
        'Ryzen 7000 Series': ['Ryzen 9 7940HS', 'Ryzen 7 7840HS', 'Ryzen 7 7735HS', 'Ryzen 5 7530U']
    }
};

// ──────────────────────────────────────────────
// Processor Specs Database — Real benchmark data
// Sources: NanoReview, Geekbench Browser, AnTuTu, NotebookCheck
// ──────────────────────────────────────────────
const PROCESSOR_SPECS = {
    // QUALCOMM
    'Snapdragon 8 Elite':       { company:'Qualcomm', arch:'ARMv9.2', nm:'3nm TSMC', cores:'8 (2×X925 + 6×A725)', clock:'4.32 GHz', gpu:'Adreno 830', antutu:2850000, gb_single:3100, gb_multi:9800, nano_cpu:96, nano_gpu:98, nano_battery:78 },
    'Snapdragon 8s Gen 3':      { company:'Qualcomm', arch:'ARMv9', nm:'4nm TSMC', cores:'8 (1×X4 + 4×A720 + 3×A520)', clock:'3.0 GHz', gpu:'Adreno 735', antutu:1550000, gb_single:1950, gb_multi:5200, nano_cpu:80, nano_gpu:78, nano_battery:82 },
    'Snapdragon 8 Gen 3':       { company:'Qualcomm', arch:'ARMv9', nm:'4nm TSMC', cores:'8 (1×X4 + 5×A720 + 2×A520)', clock:'3.3 GHz', gpu:'Adreno 750', antutu:2050000, gb_single:2200, gb_multi:6800, nano_cpu:90, nano_gpu:92, nano_battery:80 },
    'Snapdragon 8 Gen 2':       { company:'Qualcomm', arch:'ARMv9', nm:'4nm TSMC', cores:'8 (1×X3 + 4×A715 + 3×A510)', clock:'3.2 GHz', gpu:'Adreno 740', antutu:1550000, gb_single:2000, gb_multi:5400, nano_cpu:85, nano_gpu:88, nano_battery:82 },
    'Snapdragon 8+ Gen 1':      { company:'Qualcomm', arch:'ARMv9', nm:'4nm TSMC', cores:'8 (1×X2 + 3×A710 + 4×A510)', clock:'3.2 GHz', gpu:'Adreno 730', antutu:1150000, gb_single:1880, gb_multi:4800, nano_cpu:80, nano_gpu:82, nano_battery:78 },
    'Snapdragon 8 Gen 1':       { company:'Qualcomm', arch:'ARMv9', nm:'4nm Samsung', cores:'8 (1×X2 + 3×A710 + 4×A510)', clock:'3.0 GHz', gpu:'Adreno 730', antutu:1000000, gb_single:1700, gb_multi:4200, nano_cpu:75, nano_gpu:80, nano_battery:68 },
    'Snapdragon 7+ Gen 3':      { company:'Qualcomm', arch:'ARMv9', nm:'4nm TSMC', cores:'8 (1×X4 + 4×A720 + 3×A520)', clock:'2.8 GHz', gpu:'Adreno 732', antutu:1400000, gb_single:1850, gb_multi:4600, nano_cpu:78, nano_gpu:75, nano_battery:84 },
    'Snapdragon 7 Gen 3':       { company:'Qualcomm', arch:'ARMv9', nm:'4nm Samsung', cores:'8 (1×A715 + 3×A720 + 4×A520)', clock:'2.63 GHz', gpu:'Adreno 720', antutu:900000, gb_single:1350, gb_multi:3500, nano_cpu:68, nano_gpu:62, nano_battery:85 },
    'Snapdragon 7s Gen 3':      { company:'Qualcomm', arch:'ARMv9', nm:'4nm TSMC', cores:'8 (1×A720 + 3×A720 + 4×A520)', clock:'2.5 GHz', gpu:'Adreno 710', antutu:800000, gb_single:1250, gb_multi:3200, nano_cpu:65, nano_gpu:58, nano_battery:86 },
    'Snapdragon 7s Gen 2':      { company:'Qualcomm', arch:'ARMv9', nm:'4nm Samsung', cores:'8 (4×A720 + 4×A520)', clock:'2.4 GHz', gpu:'Adreno 710', antutu:680000, gb_single:1100, gb_multi:2900, nano_cpu:60, nano_gpu:52, nano_battery:87 },
    'Snapdragon 6 Gen 3':       { company:'Qualcomm', arch:'ARMv9', nm:'4nm', cores:'8 (4×A78 + 4×A55)', clock:'2.4 GHz', gpu:'Adreno 710', antutu:650000, gb_single:1050, gb_multi:2800, nano_cpu:58, nano_gpu:50, nano_battery:88 },
    'Snapdragon 4 Gen 2':       { company:'Qualcomm', arch:'ARMv8.2', nm:'4nm', cores:'8 (2×A78 + 6×A55)', clock:'2.2 GHz', gpu:'Adreno 613', antutu:450000, gb_single:850, gb_multi:2100, nano_cpu:42, nano_gpu:35, nano_battery:90 },
    // MEDIATEK
    'Dimensity 9400':           { company:'MediaTek', arch:'ARMv9.2', nm:'3nm TSMC', cores:'8 (1×X925 + 3×X4 + 4×A720)', clock:'3.63 GHz', gpu:'Immortalis-G925 MC12', antutu:2700000, gb_single:2900, gb_multi:9000, nano_cpu:94, nano_gpu:95, nano_battery:80 },
    'Dimensity 9300+':          { company:'MediaTek', arch:'ARMv9.2', nm:'4nm TSMC', cores:'8 (4×X4 + 4×A720)', clock:'3.4 GHz', gpu:'Immortalis-G720 MC12', antutu:2200000, gb_single:2250, gb_multi:7500, nano_cpu:88, nano_gpu:88, nano_battery:78 },
    'Dimensity 9300':           { company:'MediaTek', arch:'ARMv9.2', nm:'4nm TSMC', cores:'8 (4×X4 + 4×A720)', clock:'3.25 GHz', gpu:'Immortalis-G720 MC12', antutu:2100000, gb_single:2150, gb_multi:7300, nano_cpu:86, nano_gpu:86, nano_battery:78 },
    'Dimensity 9200+':          { company:'MediaTek', arch:'ARMv9', nm:'4nm TSMC', cores:'8 (1×X3 + 3×A715 + 4×A510)', clock:'3.35 GHz', gpu:'Immortalis-G715 MC11', antutu:1450000, gb_single:1850, gb_multi:5100, nano_cpu:80, nano_gpu:80, nano_battery:80 },
    'Dimensity 8300 Ultra':     { company:'MediaTek', arch:'ARMv9', nm:'4nm TSMC', cores:'8 (4×A715 + 4×A510)', clock:'3.35 GHz', gpu:'Mali-G615 MC6', antutu:1200000, gb_single:1450, gb_multi:4200, nano_cpu:72, nano_gpu:68, nano_battery:84 },
    'Dimensity 7200 Pro':       { company:'MediaTek', arch:'ARMv9', nm:'4nm TSMC', cores:'8 (2×A715 + 6×A510)', clock:'2.8 GHz', gpu:'Mali-G610 MC4', antutu:750000, gb_single:1100, gb_multi:2900, nano_cpu:58, nano_gpu:48, nano_battery:86 },
    'Dimensity 7050':           { company:'MediaTek', arch:'ARMv9', nm:'6nm TSMC', cores:'8 (2×A78 + 6×A55)', clock:'2.6 GHz', gpu:'Mali-G68 MC4', antutu:550000, gb_single:900, gb_multi:2400, nano_cpu:48, nano_gpu:40, nano_battery:88 },
    'Dimensity 6300':           { company:'MediaTek', arch:'ARMv8.2', nm:'6nm', cores:'8 (2×A76 + 6×A55)', clock:'2.4 GHz', gpu:'Mali-G57 MC2', antutu:400000, gb_single:720, gb_multi:1900, nano_cpu:38, nano_gpu:28, nano_battery:92 },
    'Helio G99 Ultimate':       { company:'MediaTek', arch:'ARMv8.2', nm:'6nm TSMC', cores:'8 (2×A76 + 6×A55)', clock:'2.2 GHz', gpu:'Mali-G57 MC2', antutu:380000, gb_single:710, gb_multi:1850, nano_cpu:36, nano_gpu:26, nano_battery:92 },
    'Helio G99':                { company:'MediaTek', arch:'ARMv8.2', nm:'6nm TSMC', cores:'8 (2×A76 + 6×A55)', clock:'2.2 GHz', gpu:'Mali-G57 MC2', antutu:370000, gb_single:700, gb_multi:1800, nano_cpu:35, nano_gpu:25, nano_battery:92 },
    // APPLE
    'Apple A18 Pro':            { company:'Apple', arch:'ARMv9.2', nm:'3nm TSMC N3E', cores:'6 (2P + 4E)', clock:'4.05 GHz', gpu:'Apple 6-core GPU', antutu:1830000, gb_single:3400, gb_multi:8350, nano_cpu:97, nano_gpu:94, nano_battery:88 },
    'Apple A18':                { company:'Apple', arch:'ARMv9.2', nm:'3nm TSMC N3E', cores:'6 (2P + 4E)', clock:'3.7 GHz', gpu:'Apple 5-core GPU', antutu:1650000, gb_single:3100, gb_multi:7600, nano_cpu:92, nano_gpu:88, nano_battery:90 },
    'Apple A17 Pro':            { company:'Apple', arch:'ARMv9', nm:'3nm TSMC', cores:'6 (2P + 4E)', clock:'3.78 GHz', gpu:'Apple 6-core GPU', antutu:1600000, gb_single:2900, gb_multi:7200, nano_cpu:90, nano_gpu:86, nano_battery:85 },
    'Apple A16 Bionic':         { company:'Apple', arch:'ARMv9', nm:'4nm TSMC', cores:'6 (2P + 4E)', clock:'3.46 GHz', gpu:'Apple 5-core GPU', antutu:1350000, gb_single:2500, gb_multi:6400, nano_cpu:82, nano_gpu:78, nano_battery:86 },
    'Apple A15 Bionic':         { company:'Apple', arch:'ARMv8.6', nm:'5nm TSMC', cores:'6 (2P + 4E)', clock:'3.24 GHz', gpu:'Apple 5-core GPU', antutu:1100000, gb_single:2200, gb_multi:5400, nano_cpu:75, nano_gpu:72, nano_battery:88 },
    // SAMSUNG
    'Exynos 2500':              { company:'Samsung', arch:'ARMv9.2', nm:'3nm GAA', cores:'10 (1×X925 + 7×A725 + 2×A520)', clock:'3.3 GHz', gpu:'Xclipse 950 (RDNA3)', antutu:1800000, gb_single:2300, gb_multi:8000, nano_cpu:82, nano_gpu:80, nano_battery:78 },
    'Exynos 2400':              { company:'Samsung', arch:'ARMv9', nm:'4nm Samsung', cores:'10 (1×X4 + 5×A720 + 4×A520)', clock:'3.21 GHz', gpu:'Xclipse 940 (RDNA3)', antutu:1600000, gb_single:2100, gb_multi:6900, nano_cpu:78, nano_gpu:75, nano_battery:76 },
    'Exynos 1480':              { company:'Samsung', arch:'ARMv9', nm:'4nm Samsung', cores:'8 (4×A720 + 4×A520)', clock:'2.75 GHz', gpu:'Xclipse 530', antutu:800000, gb_single:1100, gb_multi:3100, nano_cpu:55, nano_gpu:48, nano_battery:84 },
    'Exynos 1380':              { company:'Samsung', arch:'ARMv9', nm:'5nm Samsung', cores:'8 (4×A78 + 4×A55)', clock:'2.4 GHz', gpu:'Mali-G68 MP5', antutu:600000, gb_single:950, gb_multi:2600, nano_cpu:48, nano_gpu:40, nano_battery:86 },
    // GOOGLE
    'Google Tensor G4':         { company:'Google', arch:'ARMv9', nm:'4nm Samsung', cores:'8 (1×X4 + 3×A720 + 4×A520)', clock:'3.1 GHz', gpu:'Mali-G715', antutu:1200000, gb_single:1900, gb_multi:3600, nano_cpu:72, nano_gpu:65, nano_battery:74 },
    'Google Tensor G3':         { company:'Google', arch:'ARMv9', nm:'4nm Samsung', cores:'9 (1×X3 + 4×A715 + 4×A510)', clock:'3.0 GHz', gpu:'Mali-G715 MP7', antutu:1050000, gb_single:1750, gb_multi:3400, nano_cpu:68, nano_gpu:60, nano_battery:72 },
};

const PROCESSORS = {
    phone: [
        'Apple A19 Pro', 'Apple A18 Pro', 'Apple A17 Pro', 'Apple A16 Bionic',
        'Snapdragon 8 Elite Gen 2', 'Snapdragon 8 Elite', 'Snapdragon 8 Gen 3', 'Snapdragon 8 Gen 2',
        'Dimensity 9500', 'Dimensity 9400', 'Dimensity 9300+', 'Dimensity 9200+',
        'Google Tensor G6', 'Google Tensor G5', 'Google Tensor G4', 'Google Tensor G3',
        'Exynos 2600', 'Exynos 2500', 'Exynos 2400', 'Snapdragon 7+ Gen 3', 'Dimensity 8300 Ultra'
    ],
    laptop: [
        'Apple M4 Max', 'Apple M4 Pro', 'Apple M4', 'Apple M3 Max', 'Apple M3 Pro', 'Apple M3',
        'Intel Core Ultra 9', 'Intel Core Ultra 7', 'Intel Core i9', 'Intel Core i7', 'Intel Core i5',
        'AMD Ryzen AI 9', 'AMD Ryzen 9', 'AMD Ryzen 7', 'Snapdragon X Elite', 'Snapdragon X Plus'
    ]
};

// ──────────────────────────────────────────────
// RAM / Storage / Battery options
// ──────────────────────────────────────────────
const RAM_OPTIONS = {
    phone: [4, 6, 8, 12, 16, 24],
    laptop: [8, 16, 24, 32, 64]
};

const STORAGE_OPTIONS = {
    phone: [64, 128, 256, 512, 1024],
    laptop: [256, 512, 1024, 2048]
};

const BATTERY_OPTIONS = {
    phone: [3500, 4000, 4500, 5000, 5500, 6000],
    laptop: [40, 50, 60, 70, 80, 90, 100]
};

const DEVICE_SPECS = {
    // SAMSUNG
    'Samsung Galaxy Z Fold7': { brand:'Samsung', price:174999, ram:12, storage:256, battery:4400, camera:'200+12+10 MP', display:'8.0" Dynamic AMOLED 2x', processor:'Snapdragon 8 Elite', scores:{performance:9.6,camera:9.3,battery:8.2,display:9.8,storage:8.5,value:7.0} },
    'Samsung Galaxy Z Flip7': { brand:'Samsung', price:121999, ram:12, storage:256, battery:4300, camera:'50+12 MP', display:'6.9" Dynamic AMOLED 2x', processor:'Exynos 2500', scores:{performance:9.0,camera:8.5,battery:8.0,display:9.2,storage:8.5,value:7.2} },
    'Samsung Galaxy S25 Ultra': { brand:'Samsung', price:141999, ram:12, storage:256, battery:5000, camera:'200+50+10+50 MP', display:'6.9" QHD+ AMOLED', processor:'Snapdragon 8 Elite', scores:{performance:9.9,camera:9.8,battery:9.0,display:9.9,storage:8.8,value:7.4} },
    'Samsung Galaxy S25+': { brand:'Samsung', price:99999, ram:12, storage:256, battery:4900, camera:'50+12+10 MP', display:'6.7" QHD+ AMOLED', processor:'Snapdragon 8 Elite', scores:{performance:9.7,camera:9.2,battery:8.8,display:9.6,storage:8.5,value:7.8} },
    'Samsung Galaxy S25': { brand:'Samsung', price:74999, ram:12, storage:128, battery:4000, camera:'50+12+10 MP', display:'6.2" FHD+ AMOLED', processor:'Snapdragon 8 Elite', scores:{performance:9.6,camera:8.9,battery:8.1,display:9.0,storage:8.0,value:8.0} },
    'Samsung Galaxy S24 Ultra': { brand:'Samsung', price:129999, ram:12, storage:256, battery:5000, camera:'200+50+10+12 MP', display:'6.8" QHD+ AMOLED', processor:'Snapdragon 8 Gen 3', scores:{performance:9.8,camera:9.7,battery:8.8,display:9.8,storage:9.0,value:7.5} },
    'Samsung Galaxy A55 5G': { brand:'Samsung', price:27999, ram:8, storage:128, battery:5000, camera:'50+12+5 MP', display:'6.6" FHD+ AMOLED', processor:'Exynos 1480', scores:{performance:7.5,camera:7.8,battery:8.8,display:8.5,storage:7.5,value:8.5} },
    'Samsung Galaxy A35 5G': { brand:'Samsung', price:19999, ram:8, storage:128, battery:5000, camera:'50+8+5 MP', display:'6.6" FHD+ AMOLED', processor:'Exynos 1380', scores:{performance:7.0,camera:7.2,battery:8.8,display:8.3,storage:7.5,value:8.8} },
    // APPLE
    'Apple iPhone 16 Pro Max': { brand:'Apple', price:134900, ram:8, storage:256, battery:4685, camera:'48+48+12 MP', display:'6.9" OLED ProMotion', processor:'Apple A18 Pro', scores:{performance:9.9,camera:9.7,battery:8.8,display:9.8,storage:8.5,value:7.5} },
    'Apple iPhone 16 Pro': { brand:'Apple', price:119900, ram:8, storage:256, battery:3582, camera:'48+48+12 MP', display:'6.3" OLED ProMotion', processor:'Apple A18 Pro', scores:{performance:9.9,camera:9.7,battery:8.2,display:9.6,storage:8.5,value:7.8} },
    'Apple iPhone 16': { brand:'Apple', price:69900, ram:8, storage:128, battery:3561, camera:'48+12 MP', display:'6.1" OLED', processor:'Apple A18', scores:{performance:9.4,camera:8.9,battery:8.2,display:9.1,storage:8.0,value:8.2} },
    'Apple iPhone 15 Pro Max': { brand:'Apple', price:159900, ram:8, storage:256, battery:4422, camera:'48+12+12 MP', display:'6.7" OLED ProMotion', processor:'Apple A17 Pro', scores:{performance:9.9,camera:9.8,battery:8.6,display:9.7,storage:8.5,value:7.2} },
    'Apple iPhone 15': { brand:'Apple', price:59900, ram:6, storage:128, battery:3349, camera:'48+12 MP', display:'6.1" OLED', processor:'Apple A16 Bionic', scores:{performance:8.9,camera:8.8,battery:8.0,display:9.0,storage:8.0,value:8.1} },
    // ONEPLUS
    'OnePlus 13': { brand:'OnePlus', price:62999, ram:12, storage:256, battery:6000, camera:'50+50+50 MP', display:'6.82" QHD+ AMOLED', processor:'Snapdragon 8 Elite', scores:{performance:9.8,camera:9.1,battery:9.6,display:9.5,storage:8.5,value:9.0} },
    'OnePlus 13R': { brand:'OnePlus', price:41999, ram:12, storage:256, battery:6000, camera:'50+8+50 MP', display:'6.78" FHD+ AMOLED', processor:'Snapdragon 8 Gen 3', scores:{performance:9.4,camera:8.4,battery:9.7,display:9.0,storage:8.5,value:9.3} },
    'OnePlus 12': { brand:'OnePlus', price:64999, ram:12, storage:256, battery:5400, camera:'50+64+48 MP', display:'6.82" QHD+ AMOLED', processor:'Snapdragon 8 Gen 3', scores:{performance:9.7,camera:9.2,battery:9.5,display:9.5,storage:8.5,value:9.2} },
    'OnePlus Nord 4': { brand:'OnePlus', price:30999, ram:8, storage:128, battery:5500, camera:'50+8 MP', display:'6.74" FHD+ AMOLED', processor:'Snapdragon 7+ Gen 3', scores:{performance:8.5,camera:7.8,battery:9.2,display:8.8,storage:7.5,value:9.0} },
    // XIAOMI
    'Xiaomi 14 Ultra': { brand:'Xiaomi', price:99999, ram:16, storage:512, battery:5300, camera:'50+50+50+50 MP', display:'6.73" QHD+ AMOLED', processor:'Snapdragon 8 Gen 3', scores:{performance:9.7,camera:9.8,battery:9.0,display:9.5,storage:9.5,value:8.0} },
    'Redmi Note 14 Pro+ 5G': { brand:'Xiaomi', price:28999, ram:8, storage:128, battery:5110, camera:'200+8+2 MP', display:'6.67" FHD+ AMOLED', processor:'Snapdragon 7s Gen 3', scores:{performance:7.8,camera:8.5,battery:8.8,display:8.8,storage:7.5,value:9.0} },
    'Redmi Note 14 Pro 5G': { brand:'Xiaomi', price:23999, ram:8, storage:128, battery:5500, camera:'50+8+2 MP', display:'6.67" FHD+ AMOLED', processor:'Snapdragon 7s Gen 2', scores:{performance:7.2,camera:7.5,battery:9.0,display:8.5,storage:7.5,value:8.8} },
    // GOOGLE
    'Google Pixel 9 Pro XL': { brand:'Google', price:109000, ram:16, storage:256, battery:5060, camera:'50+48+48 MP', display:'6.8" QHD+ LTPO OLED', processor:'Google Tensor G4', scores:{performance:8.8,camera:9.8,battery:8.5,display:9.5,storage:8.5,value:7.6} },
    'Google Pixel 9': { brand:'Google', price:64999, ram:12, storage:128, battery:4700, camera:'50+48 MP', display:'6.3" FHD+ OLED', processor:'Google Tensor G4', scores:{performance:8.5,camera:9.5,battery:8.2,display:9.0,storage:7.5,value:8.2} },
    'Google Pixel 8 Pro': { brand:'Google', price:106999, ram:12, storage:128, battery:5050, camera:'50+48+48 MP', display:'6.7" QHD+ LTPO OLED', processor:'Google Tensor G3', scores:{performance:8.5,camera:9.8,battery:8.2,display:9.4,storage:8.0,value:7.8} },
    // VIVO
    'Vivo X200 Pro': { brand:'Vivo', price:69999, ram:16, storage:256, battery:6000, camera:'200+50+50 MP', display:'6.78" QHD+ AMOLED', processor:'Dimensity 9400', scores:{performance:9.6,camera:9.7,battery:9.5,display:9.5,storage:8.5,value:9.0} },
    'Vivo V40 Pro': { brand:'Vivo', price:34999, ram:8, storage:256, battery:5500, camera:'50+50 MP', display:'6.78" FHD+ AMOLED', processor:'Dimensity 9200+', scores:{performance:8.5,camera:8.5,battery:9.0,display:8.8,storage:8.5,value:8.5} },
    // REALME
    'Realme GT 7 Pro': { brand:'Realme', price:53999, ram:12, storage:256, battery:6500, camera:'50+8+50 MP', display:'6.78" QHD+ AMOLED', processor:'Snapdragon 8 Elite', scores:{performance:9.8,camera:8.8,battery:9.8,display:9.5,storage:8.5,value:9.5} },
    'Realme 13 Pro+ 5G': { brand:'Realme', price:29999, ram:8, storage:256, battery:5200, camera:'50+8+50 MP', display:'6.7" FHD+ AMOLED', processor:'Snapdragon 7s Gen 2', scores:{performance:7.5,camera:8.2,battery:8.8,display:8.5,storage:8.5,value:8.8} },
    // NOTHING
    'Nothing Phone (2)': { brand:'Nothing', price:33999, ram:12, storage:256, battery:4700, camera:'50+50 MP', display:'6.7" FHD+ OLED', processor:'Snapdragon 8+ Gen 1', scores:{performance:8.8,camera:8.2,battery:8.2,display:9.0,storage:8.5,value:8.5} },
    'Nothing Phone (2a)': { brand:'Nothing', price:23999, ram:8, storage:128, battery:5000, camera:'50+50 MP', display:'6.7" FHD+ AMOLED', processor:'Dimensity 7200 Pro', scores:{performance:7.5,camera:7.8,battery:8.8,display:8.5,storage:7.5,value:9.0} },
    // IQOO
    'iQOO 13': { brand:'iQOO', price:42999, ram:12, storage:256, battery:6000, camera:'50+50+50 MP', display:'6.82" QHD+ AMOLED', processor:'Snapdragon 8 Elite', scores:{performance:9.8,camera:8.8,battery:9.6,display:9.5,storage:8.5,value:9.5} },
    'iQOO Neo 10': { brand:'iQOO', price:27999, ram:8, storage:128, battery:6100, camera:'50+8 MP', display:'6.78" FHD+ AMOLED', processor:'Dimensity 9300+', scores:{performance:9.0,camera:7.8,battery:9.5,display:8.8,storage:7.5,value:9.2} },
    // POCO
    'POCO F7 Pro': { brand:'POCO', price:34999, ram:12, storage:256, battery:6000, camera:'50+8+2 MP', display:'6.67" QHD+ AMOLED', processor:'Snapdragon 8 Gen 3', scores:{performance:9.5,camera:8.0,battery:9.5,display:9.2,storage:8.5,value:9.5} },
    'POCO F6': { brand:'POCO', price:29999, ram:8, storage:256, battery:5000, camera:'50+8 MP', display:'6.67" FHD+ AMOLED', processor:'Snapdragon 8s Gen 3', scores:{performance:8.8,camera:7.8,battery:8.8,display:8.8,storage:8.5,value:9.2} },
    // MOTOROLA
    'Motorola Edge 50 Pro': { brand:'Motorola', price:31999, ram:8, storage:256, battery:4500, camera:'50+13+10 MP', display:'6.7" FHD+ pOLED', processor:'Snapdragon 7 Gen 3', scores:{performance:8.0,camera:8.2,battery:8.0,display:8.8,storage:8.5,value:8.5} },
    // OPPO
    'OPPO Find X8 Pro': { brand:'OPPO', price:79999, ram:16, storage:256, battery:5910, camera:'50+50+50+50 MP', display:'6.78" QHD+ AMOLED', processor:'Dimensity 9400', scores:{performance:9.6,camera:9.5,battery:9.5,display:9.5,storage:8.5,value:8.5} },
};

const BRAND_RETENTION = {
    'Apple': 0.95, 'Samsung': 0.90, 'OnePlus': 0.88, 'Google': 0.85,
    'Xiaomi': 0.82, 'Vivo': 0.82, 'Realme': 0.80, 'OPPO': 0.82,
    'Nothing': 0.83, 'iQOO': 0.81, 'POCO': 0.78, 'Motorola': 0.79,
    'Infinix': 0.72, 'Tecno': 0.72, 'Dell': 0.88, 'HP': 0.85,
    'Lenovo': 0.84, 'Asus': 0.84, 'Acer': 0.80, 'MSI': 0.83, 'Microsoft': 0.88
};

// ──────────────────────────────────────────────
// Recommendation Database — Phones across all price tiers
// Data sourced from device_specs_structured_dataset.csv and internet prices.
// camera_mp: main rear camera MP, ram: in GB, display_inch: screen size,
// battery_mah: battery capacity, charging_w: fast charging wattage,
// price: current MRP in INR (from Amazon/Flipkart)
// ──────────────────────────────────────────────
const RECOMMENDATION_DB = [
    // ── LOW TIER: Under ₹15,000 ──
    { name: 'Redmi 14C 5G', brand: 'Xiaomi', price: 10499, camera_mp: 50, ram: 4, display_inch: 6.88, battery_mah: 5160, charging_w: 18, processor: 'MediaTek Dimensity 6300', storage: '64 GB' },
    { name: 'Redmi 13C 5G', brand: 'Xiaomi', price: 10999, camera_mp: 50, ram: 4, display_inch: 6.74, battery_mah: 5000, charging_w: 18, processor: 'MediaTek Dimensity 6100+', storage: '128 GB' },
    { name: 'Realme Narzo 70 Pro', brand: 'Realme', price: 14999, camera_mp: 50, ram: 8, display_inch: 6.72, battery_mah: 5000, charging_w: 45, processor: 'MediaTek Dimensity 7050', storage: '128 GB' },
    { name: 'Samsung Galaxy M15 5G', brand: 'Samsung', price: 10999, camera_mp: 50, ram: 4, display_inch: 6.5, battery_mah: 6000, charging_w: 25, processor: 'MediaTek Dimensity 6100+', storage: '128 GB' },
    { name: 'Infinix Note 40 Pro', brand: 'Infinix', price: 14999, camera_mp: 108, ram: 8, display_inch: 6.78, battery_mah: 5000, charging_w: 45, processor: 'MediaTek Helio G99 Ultimate', storage: '256 GB' },
    { name: 'Tecno Camon 30', brand: 'Tecno', price: 14499, camera_mp: 50, ram: 8, display_inch: 6.78, battery_mah: 5000, charging_w: 33, processor: 'MediaTek Dimensity 7020', storage: '256 GB' },
    { name: 'Moto G54', brand: 'Motorola', price: 12999, camera_mp: 50, ram: 8, display_inch: 6.5, battery_mah: 5000, charging_w: 18, processor: 'MediaTek Dimensity 7020', storage: '128 GB' },
    { name: 'POCO M6 Pro', brand: 'POCO', price: 11999, camera_mp: 64, ram: 6, display_inch: 6.67, battery_mah: 5000, charging_w: 67, processor: 'Qualcomm Snapdragon 4 Gen 2', storage: '128 GB' },
    // ── MID TIER: ₹15,000 – ₹30,000 ──
    { name: 'Redmi Note 14 Pro 5G', brand: 'Xiaomi', price: 23999, camera_mp: 50, ram: 8, display_inch: 6.67, battery_mah: 5500, charging_w: 45, processor: 'Qualcomm Snapdragon 7s Gen 2', storage: '128 GB' },
    { name: 'Redmi Note 14 Pro+ 5G', brand: 'Xiaomi', price: 28999, camera_mp: 200, ram: 8, display_inch: 6.67, battery_mah: 5110, charging_w: 90, processor: 'Qualcomm Snapdragon 7s Gen 3', storage: '128 GB' },
    { name: 'Samsung Galaxy A55 5G', brand: 'Samsung', price: 27999, camera_mp: 50, ram: 8, display_inch: 6.6, battery_mah: 5000, charging_w: 25, processor: 'Samsung Exynos 1480', storage: '128 GB' },
    { name: 'Samsung Galaxy A35 5G', brand: 'Samsung', price: 19999, camera_mp: 50, ram: 8, display_inch: 6.6, battery_mah: 5000, charging_w: 25, processor: 'Samsung Exynos 1380', storage: '128 GB' },
    { name: 'iQOO Z9s Pro', brand: 'iQOO', price: 22999, camera_mp: 50, ram: 8, display_inch: 6.78, battery_mah: 5500, charging_w: 80, processor: 'Qualcomm Snapdragon 7 Gen 3', storage: '128 GB' },
    { name: 'OnePlus Nord CE 4', brand: 'OnePlus', price: 24999, camera_mp: 50, ram: 8, display_inch: 6.7, battery_mah: 5500, charging_w: 100, processor: 'Qualcomm Snapdragon 7 Gen 3', storage: '128 GB' },
    { name: 'Vivo V30', brand: 'Vivo', price: 27999, camera_mp: 50, ram: 8, display_inch: 6.78, battery_mah: 5000, charging_w: 80, processor: 'Qualcomm Snapdragon 7 Gen 3', storage: '128 GB' },
    { name: 'Nothing Phone (2a)', brand: 'Nothing', price: 23999, camera_mp: 50, ram: 8, display_inch: 6.7, battery_mah: 5000, charging_w: 45, processor: 'MediaTek Dimensity 7200 Pro', storage: '128 GB' },
    { name: 'Realme 13 Pro 5G', brand: 'Realme', price: 23999, camera_mp: 50, ram: 8, display_inch: 6.7, battery_mah: 5200, charging_w: 80, processor: 'Qualcomm Snapdragon 7s Gen 2', storage: '128 GB' },
    { name: 'POCO X6 Pro', brand: 'POCO', price: 24999, camera_mp: 64, ram: 8, display_inch: 6.67, battery_mah: 5000, charging_w: 67, processor: 'MediaTek Dimensity 8300 Ultra', storage: '256 GB' },
    { name: 'Moto G85', brand: 'Motorola', price: 17999, camera_mp: 50, ram: 8, display_inch: 6.67, battery_mah: 5000, charging_w: 33, processor: 'Qualcomm Snapdragon 6s Gen 3', storage: '128 GB' },
    // ── VALUE FOR MONEY TIER: ₹30,000 – ₹50,000 ──
    { name: 'OnePlus 13R', brand: 'OnePlus', price: 41999, camera_mp: 50, ram: 12, display_inch: 6.78, battery_mah: 6000, charging_w: 80, processor: 'Qualcomm Snapdragon 8 Gen 3', storage: '256 GB' },
    { name: 'OnePlus Nord 4', brand: 'OnePlus', price: 30999, camera_mp: 50, ram: 8, display_inch: 6.74, battery_mah: 5500, charging_w: 100, processor: 'Qualcomm Snapdragon 7+ Gen 3', storage: '128 GB' },
    { name: 'iQOO 13', brand: 'iQOO', price: 42999, camera_mp: 50, ram: 12, display_inch: 6.82, battery_mah: 6000, charging_w: 120, processor: 'Qualcomm Snapdragon 8 Elite', storage: '256 GB' },
    { name: 'Samsung Galaxy S24 FE', brand: 'Samsung', price: 49999, camera_mp: 50, ram: 8, display_inch: 6.7, battery_mah: 4700, charging_w: 25, processor: 'Samsung Exynos 2400', storage: '128 GB' },
    { name: 'Nothing Phone (2)', brand: 'Nothing', price: 33999, camera_mp: 50, ram: 12, display_inch: 6.7, battery_mah: 4700, charging_w: 45, processor: 'Qualcomm Snapdragon 8+ Gen 1', storage: '256 GB' },
    { name: 'Vivo V40 Pro', brand: 'Vivo', price: 34999, camera_mp: 50, ram: 8, display_inch: 6.78, battery_mah: 5500, charging_w: 80, processor: 'MediaTek Dimensity 9200+', storage: '256 GB' },
    { name: 'Realme GT 6T', brand: 'Realme', price: 30999, camera_mp: 50, ram: 8, display_inch: 6.78, battery_mah: 5500, charging_w: 120, processor: 'Qualcomm Snapdragon 7+ Gen 3', storage: '128 GB' },
    { name: 'POCO F6', brand: 'POCO', price: 29999, camera_mp: 50, ram: 8, display_inch: 6.67, battery_mah: 5000, charging_w: 90, processor: 'Qualcomm Snapdragon 8s Gen 3', storage: '256 GB' },
    { name: 'Google Pixel 8a', brand: 'Google', price: 42999, camera_mp: 64, ram: 8, display_inch: 6.1, battery_mah: 4492, charging_w: 18, processor: 'Google Tensor G3', storage: '128 GB' },
    { name: 'Motorola Edge 50 Pro', brand: 'Motorola', price: 31999, camera_mp: 50, ram: 8, display_inch: 6.7, battery_mah: 4500, charging_w: 125, processor: 'Qualcomm Snapdragon 7 Gen 3', storage: '256 GB' },
    // ── HIGH TIER: ₹50,000+ ──
    { name: 'Samsung Galaxy S25 Ultra', brand: 'Samsung', price: 141999, camera_mp: 200, ram: 12, display_inch: 6.9, battery_mah: 5000, charging_w: 45, processor: 'Qualcomm Snapdragon 8 Elite', storage: '256 GB' },
    { name: 'Samsung Galaxy S25', brand: 'Samsung', price: 74999, camera_mp: 50, ram: 12, display_inch: 6.2, battery_mah: 4000, charging_w: 25, processor: 'Qualcomm Snapdragon 8 Elite', storage: '128 GB' },
    { name: 'Samsung Galaxy Z Fold7', brand: 'Samsung', price: 174999, camera_mp: 200, ram: 12, display_inch: 8.0, battery_mah: 4400, charging_w: 25, processor: 'Qualcomm Snapdragon 8 Elite', storage: '256 GB' },
    { name: 'Samsung Galaxy Z Flip7', brand: 'Samsung', price: 121999, camera_mp: 50, ram: 12, display_inch: 6.9, battery_mah: 4300, charging_w: 25, processor: 'Samsung Exynos 2500', storage: '256 GB' },
    { name: 'Apple iPhone 16 Pro Max', brand: 'Apple', price: 134900, camera_mp: 48, ram: 8, display_inch: 6.9, battery_mah: 4685, charging_w: 27, processor: 'Apple A18 Pro', storage: '256 GB' },
    { name: 'Apple iPhone 16', brand: 'Apple', price: 69900, camera_mp: 48, ram: 8, display_inch: 6.1, battery_mah: 3561, charging_w: 27, processor: 'Apple A18', storage: '128 GB' },
    { name: 'Apple iPhone 15', brand: 'Apple', price: 59900, camera_mp: 48, ram: 6, display_inch: 6.1, battery_mah: 3349, charging_w: 20, processor: 'Apple A16 Bionic', storage: '128 GB' },
    { name: 'OnePlus 13', brand: 'OnePlus', price: 62999, camera_mp: 50, ram: 12, display_inch: 6.82, battery_mah: 6000, charging_w: 100, processor: 'Qualcomm Snapdragon 8 Elite', storage: '256 GB' },
    { name: 'Google Pixel 9 Pro XL', brand: 'Google', price: 109000, camera_mp: 50, ram: 16, display_inch: 6.8, battery_mah: 5060, charging_w: 37, processor: 'Google Tensor G4', storage: '256 GB' },
    { name: 'Google Pixel 9', brand: 'Google', price: 64999, camera_mp: 50, ram: 12, display_inch: 6.3, battery_mah: 4700, charging_w: 27, processor: 'Google Tensor G4', storage: '128 GB' },
    { name: 'Vivo X200 Pro', brand: 'Vivo', price: 69999, camera_mp: 200, ram: 16, display_inch: 6.78, battery_mah: 6000, charging_w: 90, processor: 'MediaTek Dimensity 9400', storage: '256 GB' },
    { name: 'OnePlus 12', brand: 'OnePlus', price: 64999, camera_mp: 50, ram: 12, display_inch: 6.82, battery_mah: 5400, charging_w: 100, processor: 'Qualcomm Snapdragon 8 Gen 3', storage: '256 GB' },
    { name: 'OPPO Find X8 Pro', brand: 'OPPO', price: 79999, camera_mp: 50, ram: 16, display_inch: 6.78, battery_mah: 5910, charging_w: 80, processor: 'MediaTek Dimensity 9400', storage: '256 GB' },
    { name: 'Realme GT 7 Pro', brand: 'Realme', price: 53999, camera_mp: 50, ram: 12, display_inch: 6.78, battery_mah: 6500, charging_w: 120, processor: 'Qualcomm Snapdragon 8 Elite', storage: '256 GB' },
    { name: 'Nothing Phone (3)', brand: 'Nothing', price: 54999, camera_mp: 50, ram: 12, display_inch: 6.5, battery_mah: 5120, charging_w: 45, processor: 'Qualcomm Snapdragon 8s Gen 3', storage: '256 GB' },
    { name: 'POCO F7 Pro', brand: 'POCO', price: 34999, camera_mp: 50, ram: 12, display_inch: 6.67, battery_mah: 6000, charging_w: 120, processor: 'Qualcomm Snapdragon 8 Gen 3', storage: '256 GB' }
];
