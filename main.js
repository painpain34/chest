
let isNewGame = true;
// 引入角色属性
import { character, updateCharacterStats} from './chara.js';
// 引入装备相关功能
import { 
    EQUIPMENT_TYPES, 
    EQUIPMENT_SLOTS, 
    generateRandomEquipment,
    equipmentColor 
} from './equipment.js';
//导入装备和冒险函数
import { ADVENTURE_MAPS, initAdventurePage } from './adventure.js';
import { SKILLS, initSkillsPage } from './skills.js';
let reportContent = document.getElementById('report-content');

// 玩家当前装备
export let playerEquipment = Array(9).fill(null);
let keyboardEnabled = true;
// 当前打开的装备
let currentEquipment = null;
// 页面状态缓存
const pageStates = new Map();
// 在全局变量部分添加
let chestLevel = 1; // 宝箱等级
// 添加全局格式化函数
function formatNumber(num) {
    return num >= 10000 ? num.toExponential(2) : num;
}


// 游戏初始化
function initGame() {
    
    // 初始化装备栏
    const equipmentGrid = document.getElementById('equipment-grid');
    for (let i = 0; i < 9; i++) {
        const slot = document.createElement('div');
        slot.className = 'equipment-slot';
        slot.id = `slot-${i}`;
        equipmentGrid.appendChild(slot);
    }
   
        // 初始化页面显示状态
        document.querySelectorAll('.page').forEach(page => {
            page.style.display = 'none';
            page.style.visibility = 'hidden';
            page.style.position = 'absolute';
            page.style.opacity = '0';
        });
    // 初始化冒险和技能页面
    initAdventurePage();
    initSkillsPage();
    // 单独设置保存按钮
    document.getElementById('nav-save').addEventListener('click', () => {
    saveGame();
    addReport('游戏已保存');
    });
    document.getElementById('nav-load').addEventListener('click', () => {
        startGame(false);
        addReport('游戏已读档');
        });

    reportContent.innerHTML = ''; // 清空报告栏
    //启动导航栏功能
    setupNavigation();

    // 绑定宝箱点击事件
    document.getElementById('chest-img').addEventListener('click', openChest);
    
    // 绑定按钮事件
    document.getElementById('equip-btn').addEventListener('click', equipItem);
    document.getElementById('sell-btn').addEventListener('click', function() {
        sellItem(currentEquipment); // 明确传递当前装备
    });

    // 绑定升级按钮事件
    document.getElementById('upgrade-chest').addEventListener('click', upgradeChest);
    document.addEventListener('keydown', (e) => {
        if (!keyboardEnabled) return;
        
        // 空格键开宝箱
        if (e.code === 'Space' && document.getElementById('chest-page').style.display === 'block') {
            openChest();
        }
        
        // 装备窗口按键
        if (document.getElementById('modal').style.display === 'flex') {
            if (e.code === 'KeyY') {
                equipItem();
            } else if (e.code === 'KeyN') {
                sellItem(currentEquipment);
            }
        }
    });
    
    // 添加宝箱等级显示
    const chestLevelDisplay = document.createElement('div');
    chestLevelDisplay.id = 'chest-level';
    chestLevelDisplay.textContent = `宝箱等级: ${chestLevel}`;
    document.getElementById('chest').prepend(chestLevelDisplay);
 // 检查是否有存档
 if (!localStorage.getItem('gameSave')) {
    startGame(true);
    return;
}
    startGame(false)
}


//开始游戏按钮
function startGame(isNew) {
    if(isNew) {
        // 新游戏初始化
        playerEquipment = Array(9).fill(null);
        character.gold = 0;
        chestLevel = 1;
        character.gold = 0;
        character.level = 1;
        character.exp = 0;
        character.skillPoints = 0;
        chestLevel = 1;
    } else {
         // 加载存档
         loadGame();
         // 刷新技能页面
         initSkillsPage();  // 新增
    }
     
    document.getElementById('top-nav').style.display = 'block';
    document.getElementById('character-stats').style.display = 'block';
    document.getElementById('report-panel').style.display = 'block';
    switchPage('chest');
    
 
   //刷新装备栏和属性栏
    updateEquipmentDisplay();
    updateCharacterStats();
    // 刷新宝箱等级显示
    document.getElementById('chest-level').textContent = `宝箱等级: ${chestLevel}`;
 
}


// 打开宝箱
function openChest() {
    if (!keyboardEnabled || document.getElementById('modal').style.display === 'flex') {
        return;
    }
    // 切换宝箱图片
    document.getElementById('chest-img').src = 'chest2.png';
    
    // 生成随机装备
    currentEquipment = generateRandomEquipment(chestLevel);;
    

    const currentPower = currentEquipment.attack + currentEquipment.defense + currentEquipment.health;
    const oldEquipment = playerEquipment[EQUIPMENT_SLOTS[currentEquipment.type]];
    const oldPower = oldEquipment ? 
        (oldEquipment.attack + oldEquipment.defense + oldEquipment.health) : 0;
    const powerDiff = currentPower - oldPower;
    // 显示装备信息
    document.getElementById('equipment-name').textContent = currentEquipment.name;
    document.getElementById('equipment-stats').textContent = 
        `攻击: ${currentEquipment.attack} 防御: ${currentEquipment.defense} 生命: ${currentEquipment.health}`;
    document.getElementById('equipment-power').textContent = `战斗力: ${currentPower}`;
    document.getElementById('equipment-diff').textContent = `战斗力增加：${powerDiff}`;



    
    // 设置装备名称颜色
    const nameElement = document.getElementById('equipment-name');
    
    
    const tempDiv = document.createElement('div');
    equipmentColor(tempDiv, currentEquipment);
    nameElement.style.color = tempDiv.style.color;
    
    // 显示弹窗
    document.getElementById('modal').style.display = 'flex';
}


// 升级宝箱函数
function upgradeChest() {
    const upgradeCost = 100 * chestLevel; // 升级所需金币
    
    if (character.gold < upgradeCost) {
        addReport('金币不足');
        return;
    }

    character.gold -= upgradeCost;
    chestLevel++;
    document.getElementById('chest-level').textContent = `宝箱等级: ${chestLevel}`;
    addReport(`宝箱已升级到${chestLevel}级！高级装备爆率提升`);
    updateCharacterStats();
}



// 装备物品
function equipItem() {
    const slotIndex = EQUIPMENT_SLOTS[currentEquipment.type];
    const oldEquipment = playerEquipment[slotIndex];
    
    // 替换装备
    playerEquipment[slotIndex] = currentEquipment;
    updateEquipmentDisplay();
    updateCharacterStats(); // 新增
    

    // 关闭弹窗
    document.getElementById('modal').style.display = 'none';
    document.getElementById('chest-img').src = 'chest1.png';
    
    
    // 如果有旧装备，自动出售
    if (oldEquipment) {
        sellItem(oldEquipment);
    }
}

// 出售物品
function sellItem(equipment) {
    if (!equipment) {
        console.error('没有可出售的装备');
        return;
    }

    console.log('出售的装备详情:', JSON.stringify(equipment));
    
    const sellPrice = Math.floor(
        Math.sqrt(equipment.attack + equipment.defense + equipment.health) * 10 * character.goldBonus
    );
    console.log(`出售装备获得金币: ${sellPrice}`);  // 新增金币售出价格监控
    character.gold += sellPrice;
    updateCharacterStats(); // 新增
    
    document.getElementById('modal').style.display = 'none';
    document.getElementById('chest-img').src = 'chest1.png';
}

// 更新装备显示
function updateEquipmentDisplay() {
    for (let i = 0; i < playerEquipment.length; i++) {
        const slot = document.getElementById(`slot-${i}`);
        const equipment = playerEquipment[i];
        equipmentColor(slot, equipment); // 传递参数
    }
}
// 优化后的导航设置
function setupNavigation() {
    const navButtons = {
        'nav-chest': 'chest',
        'nav-adventure': 'adventure', 
        'nav-skills': 'skills'
    };

    Object.entries(navButtons).forEach(([id, page]) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () =>  {
                console.log(`导航按钮被点击: ${id} -> 切换到 ${page} 页面`);
                switchPage(page)
            });
  
        }
    });
}

// 优化后的页面切换
function switchPage(pageName) {
    // 保存当前页面状态
    document.querySelectorAll('.page').forEach(page => {
        if (page.classList.contains('active')) {
            pageStates.set(page.id, {
                scrollPosition: page.scrollTop,
                formData: collectFormData(page)
            });
        }
    });

    // 切换页面显示
    document.querySelectorAll('.page').forEach(page => {
        const isActive = page.id === `${pageName}-page`;
        if (isActive) {
            page.classList.add('active');
            page.style.display = 'block';
            page.style.visibility = 'visible';
            page.style.position = 'static';
            page.style.opacity = '1';
            
            // 恢复页面状态
            if (pageStates.has(page.id)) {
                const state = pageStates.get(page.id);
                page.scrollTop = state.scrollPosition;
                restoreFormData(page, state.formData);
            }
        } else {
            page.classList.remove('active');
            // 确保隐藏页面时所有样式都设置正确
            page.style.display = 'none';
            page.style.visibility = 'hidden';
            page.style.position = 'absolute';
            page.style.opacity = '0';
           
        }
    });
 // 更新键盘控制状态
 keyboardEnabled = (pageName === 'chest');
    // 更新导航按钮状态
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.id === `nav-${pageName}`);
    });
}

// 辅助函数：收集表单数据
function collectFormData(page) {
    const forms = page.querySelectorAll('form');
    return Array.from(forms).map(form => {
        const data = {};
        new FormData(form).forEach((value, key) => {
            data[key] = value;
        });
        return data;
    });
}

// 辅助函数：恢复表单数据
function restoreFormData(page, formData) {
    const forms = page.querySelectorAll('form');
    forms.forEach((form, index) => {
        if (formData[index]) {
            Object.entries(formData[index]).forEach(([name, value]) => {
                const input = form.querySelector(`[name="${name}"]`);
                if (input) {
                    input.value = value;
                }
            });
        }
    });
}
// 保存游戏函数
function saveGame() {
    const saveData = {
        equipment: playerEquipment,
        gold: character.gold,
        chestLevel: chestLevel,
        exp: character.exp,
        level: character.level,
        skillpoints: character.skillPoints,
        skillLevels: character.skillLevels
    };
    localStorage.setItem('gameSave', JSON.stringify(saveData));
}

//加载游戏函数
function loadGame() {
    const savedData = localStorage.getItem('gameSave');
    if (savedData) {
        const data = JSON.parse(savedData);
        playerEquipment = data.equipment || Array(9).fill(null);
        character.gold = data.gold || 0;
        chestLevel = data.chestLevel || 1;
        character.exp = data.exp || 0;
        character.level = data.level || 1;
        character.skillPoints = data.skillpoints || 0;
        character.skillLevels = data.skillLevels || {};
        return true;
    }
    alert('没有找到存档文件！\n请开始新游戏或检查存档数据');
    startGame(ture);
}

// 添加报告函数
export function addReport(text) {
    const reportItem = document.createElement('div');
    reportItem.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
    reportItem.style.marginBottom = '8px';
    reportContent.appendChild(reportItem);
    // 确保新报告可见
    reportItem.scrollIntoView({ behavior: 'smooth' });
    reportContent.scrollTop = reportContent.scrollHeight;
}
// 启动游戏
window.onload = initGame;