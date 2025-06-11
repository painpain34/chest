// 在文件顶部添加导入
import { character, updateCharacterStats } from './chara.js';
import { addReport } from './main.js';

// 技能数据
export const SKILLS = [
    { id: 1, name: '攻击强化', desc: '增加10%攻击力', cost: 1 },
    { id: 2, name: '防御强化', desc: '增加10%防御力', cost: 1 },
    { id: 3, name: '生命强化', desc: '增加10%生命值', cost: 1 },
    { id: 4, name: '金币加成', desc: '冒险获得金币+20%', cost: 2}
];

// 初始化技能页面
export function initSkillsPage() {
    const container = document.getElementById('skills-container');
    container.innerHTML = '';

    
    SKILLS.forEach(skill => {
        const skillElement = document.createElement('div');
        skillElement.className = 'skill-item';
        skillElement.innerHTML = `
            <h3>${skill.name}</h3>
            <div>等级: ${character.skillLevels[skill.id] || 0}</div>
           <button class="upgrade-skill skill-btn" data-skill-id="${skill.id}">升级</button>
        `;
        container.appendChild(skillElement);
    });
    
    // 绑定升级按钮事件
    document.querySelectorAll('.upgrade-skill').forEach(btn => {
        btn.addEventListener('click', function() {
            const skillId = this.getAttribute('data-skill-id');
            upgradeSkill(skillId);
        });
    });
}

function upgradeSkill(skillId) {
    const skill = SKILLS.find(s => s.id == skillId);
    if (!skill) return;

    if (character.skillPoints >= skill.cost) {
        character.skillPoints -= skill.cost;  // 正确扣除技能点
        character.skillLevels[skillId] = (character.skillLevels[skillId] || 0) + 1;
        updateCharacterStats();
        initSkillsPage();
        addReport(`${skill.name}升级成功！当前等级:${character.skillLevels[skillId]}`);
    } else {
        addReport(`技能点不足，需要${skill.cost}点技能点`);
    }
}
