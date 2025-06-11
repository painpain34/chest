import { playerEquipment } from './main.js';
import { SKILLS } from './skills.js';

// 称号等级配置
const TITLES = [
    { min: 0, max: 1000, name: '平民' },
    { min: 1001, max: 10000, name: '士兵' },
    { min: 10001, max: 50000, name: '骑士' },
    { min: 50001, max: 100000, name: '骑士长' },
    { min: 100001, max: 1000000, name: '男爵' },
    { min: 1000001, max: 3000000, name: '子爵' },
    { min: 3000001, max: 8000000, name: '伯爵' },
    { min: 8000001, max: 20000000, name: '侯爵' },
    { min: 20000001, max: 50000000, name: '公爵' },
    { min: 50000001, max: 75000000, name: '皇帝' },
    { min: 75000001, max: 100000000, name: '帝君' },
    { min: 100000001, max: 200000000, name: '行星级强者' },
    { min: 200000001, max: 350000000, name: '恒星级霸主' },
    { min: 350000001, max: 500000000, name: '银河系首领' },
    { min: 500000001, max: 999999999999, name: '永恒之主' }


];

// 角色初始属性
export const character = {
    gold: 0,
    get attackMultiplier() {
        const skillLevel = this.skillLevels[1] || 0; // 1是攻击强化技能ID
        return 1 + (skillLevel * 0.1); // 每级增加10%
    },
    get defenseMultiplier() {
        const skillLevel = this.skillLevels[2] || 0; // 2是防御强化技能ID
        return 1 + (skillLevel * 0.1); // 每级增加10%
    },
    get healthMultiplier() {
        const skillLevel = this.skillLevels[3] || 0; // 3是生命强化技能ID
        return 1 + (skillLevel * 0.1); // 每级增加10%
    },
    exp:0,
    get goldBonus() {
        // 基础值为1，每级金币加成技能增加0.2
        const skillLevel = this.skillLevels[4] || 0; // 4是金币加成技能的ID
        return 1 + (skillLevel * 0.2);
    },
    skillLevels: {}, // 添加技能等级对象
    _skillPoints: 0, // 显式初始化
    get skillPoints() {
        return this._skillPoints || 0;
    },
    set skillPoints(value) {
        this._skillPoints = value;
    },
    get totalAttack() {
        return playerEquipment.reduce((sum, item) => sum + (item?.attack || 0), 0) * character.attackMultiplier;
    },
    get totalDefense() {
        return playerEquipment.reduce((sum, item) => sum + (item?.defense || 0), 0) * character.defenseMultiplier;
    },
    get totalHealth() {
        return playerEquipment.reduce((sum, item) => sum + (item?.health || 0), 0) * character.healthMultiplier;
    },
    get combatPower() {
        return character.totalAttack * character.attackMultiplier + character.totalDefense * character.defenseMultiplier + character.totalHealth * character.healthMultiplier;
    },
    get title() {
        const power = this.combatPower;
        const matched = TITLES.find(t => power >= t.min && power <= t.max);
        return matched ? matched.name : '未知';
    }
};

// 更新角色属性显示
export function updateCharacterStats() {
      // 经验值转换逻辑 - 修改为使用除法计算完整等级提升
      const levelUps = Math.floor(character.exp / 100);
      if (levelUps > 0) {
          character.exp %= 100; // 保留剩余经验值
          character.skillPoints += levelUps; // 一次性增加所有技能点
      }
    //使用科学计数法
    function formatNumber(num) {
        if (typeof num !== 'number') return num;
        return num >= 10000 ? num.toExponential(2) : Math.floor(num);
    }
    const statsPanel = document.getElementById('character-stats');
    statsPanel.innerHTML = `
         <div>战斗力:<div class="stat-subtitle"> ${formatNumber(character.combatPower)}</div>
        <div class="stat-title">称号: ${character.title}</div>
        <div class="stat-line">攻击力: ${formatNumber(character.totalAttack)}</div>
        <div class="stat-line">防御力: ${formatNumber(character.totalDefense)}</div>
        <div class="stat-line">生命值: ${formatNumber(character.totalHealth)}</div>
        <div class="stat-line">金币: ${formatNumber(character.gold)}</div>
        <div class="stat-line">技能点: ${formatNumber(character.skillPoints)}</div>
        <div class="stat-line">经验值: ${formatNumber(character.exp)}</div>
       
    `;
}

