const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'client/build')));

// 数据文件路径
const DATA_FILE = path.join(__dirname, 'vote-data.json');

// 初始化数据结构
const initData = {
  settings: {
    totalPeople: 5,
    options: ['选项1', '选项2']
  },
  votes: {},
  isVotingComplete: false,
  results: null
};

// 确保数据文件存在
const ensureDataFile = async () => {
  try {
    await fs.access(DATA_FILE);
  } catch (error) {
    await fs.writeJson(DATA_FILE, initData);
  }
};

// 读取数据
const readData = async () => {
  try {
    return await fs.readJson(DATA_FILE);
  } catch (error) {
    return initData;
  }
};

// 写入数据
const writeData = async (data) => {
  await fs.writeJson(DATA_FILE, data);
};

// API 路由

// 获取投票配置和状态
app.get('/api/vote-status', async (req, res) => {
  try {
    const data = await readData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: '读取数据失败' });
  }
});

// 更新投票设置
app.post('/api/settings', async (req, res) => {
  try {
    const { totalPeople, options } = req.body;
    const data = await readData();
    
    data.settings.totalPeople = totalPeople;
    data.settings.options = options;
    
    // 重置投票状态
    data.votes = {};
    data.isVotingComplete = false;
    data.results = null;
    
    await writeData(data);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: '保存设置失败' });
  }
});

// 提交投票
app.post('/api/vote', async (req, res) => {
  try {
    const { voterId, selectedOption } = req.body;
    const data = await readData();
    
    if (data.isVotingComplete) {
      return res.status(400).json({ error: '投票已结束' });
    }
    
    // 记录投票
    data.votes[voterId] = selectedOption;
    
    // 检查是否所有人都投票了
    const voteCount = Object.keys(data.votes).length;
    if (voteCount >= data.settings.totalPeople) {
      data.isVotingComplete = true;
      
      // 计算结果
      const results = {};
      
      // 获取选项文本，兼容新旧格式
      const getOptionText = (option) => {
        return typeof option === 'object' ? option.text : option;
      };
      
      // 初始化结果对象
      data.settings.options.forEach(option => {
        const optionText = getOptionText(option);
        // 只统计可见选项
        if (typeof option === 'object' && !option.visible) {
          return;
        }
        results[optionText] = 0;
      });
      
      // 统计投票
      Object.values(data.votes).forEach(vote => {
        if (results.hasOwnProperty(vote)) {
          results[vote]++;
        }
      });
      
      data.results = results;
    }
    
    await writeData(data);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: '投票失败' });
  }
});

// 重置投票
app.post('/api/reset', async (req, res) => {
  try {
    const data = await readData();
    data.votes = {};
    data.isVotingComplete = false;
    data.results = null;
    
    await writeData(data);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: '重置失败' });
  }
});

// 服务React应用
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// 启动服务器
const startServer = async () => {
  await ensureDataFile();
  app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
    console.log(`访问地址: http://localhost:${PORT}`);
  });
};

startServer();