// 在文件顶部添加导入
import { character, updateCharacterStats } from './chara.js';
import { addReport } from './main.js';

// 冒险地图数据
export const ADVENTURE_MAPS = [
    { id: 1, name: '新手村', exp: 10, gold: 50, time: 5, powerRequirement: 10  },
    { id: 2, name: '黑暗洞穴', exp: 30, gold: 100, time: 5, powerRequirement: 500  },
    { id: 3, name: '死亡沙漠', exp: 60, gold: 200, time: 5, powerRequirement: 50000  },
    { id: 4, name: '巨龙山脉', exp: 120, gold: 400, time: 5, powerRequirement: 100000  },
    { id: 5, name: '哀嚎洞穴', exp: 150, gold: 600, time: 5, powerRequirement: 300000  },
    { id: 6, name: '十字路口', exp: 200, gold: 700, time: 5, powerRequirement: 1000000  },
    { id: 7, name: '血色修道院', exp: 300, gold: 800, time: 5, powerRequirement: 5000000  },
    { id: 8, name: '幽暗城', exp: 400, gold: 1000, time: 5, powerRequirement: 100000000  }
];

// 初始化冒险页面
export function initAdventurePage() {
    const container = document.getElementById('adventure-page');
    container.innerHTML = '';
    // 创建按钮容器
    const btnContainer = document.createElement('div');
    btnContainer.className = 'adventure-btn-container';
    container.appendChild(btnContainer);

    ADVENTURE_MAPS.forEach(map => {
        const btn = document.createElement('button');
        btn.className = 'adventure-btn';
        btn.innerHTML = `
            <div>${map.name}</div>
            <div>经验: ${map.exp}</div>
            <div>金币: ${map.gold}</div>
            <div>耗时: ${map.time}秒</div>
            <div>战力需求: ${map.powerRequirement}</div>
        `;
        // 修改按钮点击事件
        btn.addEventListener('click', function() {
            startAdventure(map, this);
        });
        btnContainer.appendChild(btn);
    });
};
// 修改startAdventure函数
function startAdventure(map, btn) {
    // 如果按钮已经是激活状态，则停止冒险
    if(btn.classList.contains('active')) {
        btn.classList.remove('active');
        clearInterval(btn.adventureInterval);
        btn.adventureInterval = null; // 清除计时器引用
        addReport(`已取消${map.name}冒险`);
        return;
    }

    // 重置所有其他按钮状态
    document.querySelectorAll('.adventure-btn').forEach(b => {
        if(b !== btn) {
            b.classList.remove('active');
            clearInterval(b.adventureInterval);
        }
    });

    // 设置当前按钮为激活状态
    btn.classList.add('active');
    
    // 确保数值为数字类型
    const mapExp = Number(map.exp);
    const mapGold = Number(map.gold);
    const mapTime = Number(map.time);
    const powerReq = Number(map.powerRequirement);

    const powerRatio = Math.min(1, character.combatPower / powerReq);
    addReport(`开始${map.name}冒险(战力需求:${powerReq})`);

    // 存储计时器引用到按钮对象上
    btn.adventureInterval = setInterval(() => {
        const finalExp = Math.floor(mapExp * powerRatio);
        const finalGold = Math.floor(mapGold * powerRatio * character.goldBonus);
        character.exp += finalExp;
        character.gold += finalGold;
        updateCharacterStats();
        addReport(`冒险中...获得${finalExp}经验和${finalGold}金币`);
    }, 5000);
}

