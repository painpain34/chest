// 装备类型
export const EQUIPMENT_TYPES = ['头盔', '铠甲', '靴子', '长剑', '盾牌', '腿甲', '戒指', '项链', '披风'];

// 装备栏位置映射
export const EQUIPMENT_SLOTS = {
    '头盔': 0,
    '铠甲': 1,
    '靴子': 2,
    '长剑': 3,
    '盾牌': 4,
    '腿甲': 5,
    '戒指': 6,
    '项链': 7,
    '披风': 8
};

// 生成随机装备
export function generateRandomEquipment(chestLevel) {
    const type = EQUIPMENT_TYPES[Math.floor(Math.random() * EQUIPMENT_TYPES.length)];
    
    // 生成装备等级 (1-1000级，等级越高概率越低)
    function generateEquipmentLevel() {
        // 使用指数分布使高等级装备更稀有
        const u = Math.random() / Math.max(0.1, 3 - chestLevel / 100);
        const level = Math.floor(Math.floor(100 + chestLevel * 20) * (1 - Math.sqrt(1 - u))+ chestLevel);
        return level;
    }

    // 根据装备等级生成属性值
    function generateRandomValue(level) {
        // 基础属性 = 等级 * 随机系数 * 宝箱等级加成
        const baseValue = level * (10 + Math.random() * 10) + (1 + chestLevel * 10);
        
        // 随机波动范围 ±20%
        const fluctuation = 1 + (Math.random() * 0.4 - 0.2);
        
        return Math.floor(baseValue * fluctuation);
    }

    const equipmentLevel = generateEquipmentLevel();
    
    return {
        name: `${type} Lv.${equipmentLevel}`,
        attack: generateRandomValue(equipmentLevel),
        defense: generateRandomValue(equipmentLevel),
        health: generateRandomValue(equipmentLevel),
        type: type,
        level: equipmentLevel
    };
}

//装备颜色功能
export function equipmentColor(slot, equipment){
    if (equipment) {
        slot.innerHTML = `<div>${equipment.name}</div>`;
        const totalStats = equipment.attack + equipment.defense + equipment.health;
        
        const colorMap = {
            'red': [10000001, Infinity],
            'gold': [5000001, 10000000],
            'purple': [100001, 5000000],
            'blue': [10001, 100000],
            'green': [5001, 10000],
            'black': [0, 5000]
        };
        
        const color = Object.entries(colorMap).find(([_, [min, max]]) => 
            totalStats >= min && totalStats <= max
        )?.[0] || 'black'; // 统一默认颜色
        
        slot.style.color = color;
    } else {
        slot.innerHTML = '';
        slot.style.color = 'black';
    }
}