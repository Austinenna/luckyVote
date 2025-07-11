import React, { useState, useEffect } from 'react';

const VoteInterface = ({ voteData, onSubmitVote, onReset }) => {
  const [selectedOption, setSelectedOption] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [hasVoted, setHasVoted] = useState(false);

  // 生成随机标识
  const generateRandomId = () => {
    const adjectives = ['快乐的', '聪明的', '勇敢的', '友善的', '活泼的', '温柔的', '机智的', '幽默的'];
    const animals = ['小猫', '小狗', '小鸟', '小兔', '小熊', '小鱼', '小鹿', '小象'];
    const numbers = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
    
    return `${randomAdjective}${randomAnimal}${numbers}`;
  };

  // 初始化时生成随机标识
  const [voterId, setVoterId] = useState(() => generateRandomId());

  const handleGenerateId = () => {
    setVoterId(generateRandomId());
  };

  if (!voteData) {
    return (
      <div className="vote-card text-center">
        <p className="text-gray-600">加载投票数据中...</p>
      </div>
    );
  }

  const { settings, votes, isVotingComplete, results } = voteData;
  const voteCount = Object.keys(votes).length;
  const remainingVotes = settings.totalPeople - voteCount;

  // 获取可见的选项
  const getVisibleOptions = () => {
    if (!settings.options) return [];
    // 兼容旧格式：如果是字符串数组，全部显示
    if (typeof settings.options[0] === 'string') {
      return settings.options;
    }
    // 新格式：只返回可见的选项
    return settings.options.filter(option => option.visible).map(option => option.text);
  };

  const visibleOptions = getVisibleOptions();

  const handleSubmitVote = async (e) => {
    e.preventDefault();
    
    if (!selectedOption) {
      setMessage('请选择一个选项');
      return;
    }
    
    if (!voterId.trim()) {
      setMessage('请输入您的标识（可以是昵称或编号）');
      return;
    }
    
    setLoading(true);
    setMessage('');
    
    const result = await onSubmitVote(voterId.trim(), selectedOption);
    
    setLoading(false);
    
    if (result.success) {
      setHasVoted(true);
      setMessage('投票成功！');
      setSelectedOption('');
      setVoterId('');
    } else {
      setMessage(result.error || '投票失败');
    }
  };

  const handleReset = async () => {
    if (window.confirm('确定要重置投票吗？这将清除所有投票记录。')) {
      const result = await onReset();
      if (result.success) {
        setHasVoted(false);
        setMessage('投票已重置');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(result.error || '重置失败');
      }
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  // 如果投票已完成，显示结果预览
  if (isVotingComplete) {
    return (
      <div className="space-y-6">
        <div className="vote-card text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">投票结果</h2>
          <p className="text-gray-600 mb-6">所有 {settings.totalPeople} 人都已投票完成</p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">投票结果</h3>
            <div className="space-y-3">
              {Object.entries(results).map(([option, count]) => {
                const percentage = ((count / settings.totalPeople) * 100).toFixed(1);
                // 确保选项显示为字符串，兼容新旧格式
                const optionText = typeof option === 'object' ? option.text || option : option;
                return (
                  <div key={optionText} className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{optionText}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600 w-16 text-right">
                        {count}票 ({percentage}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <button
            onClick={handleReset}
            className="vote-button vote-button-secondary"
          >
            重新开始投票
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 投票状态 */}
      <div className="vote-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">当前投票</h2>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{voteCount}/{settings.totalPeople}</div>
            <div className="text-sm text-gray-600">已投票人数</div>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(voteCount / settings.totalPeople) * 100}%` }}
          ></div>
        </div>
        
        <p className="text-gray-600">
          {remainingVotes > 0 ? `还需要 ${remainingVotes} 人投票` : '投票即将完成...'}
        </p>
      </div>

      {/* 投票表单 */}
      {!hasVoted && (
        <div className="vote-card">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">请选择您的选项</h3>
          
          <form onSubmit={handleSubmitVote} className="space-y-6">
            {/* 选项列表 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                选择选项 *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {visibleOptions.map((option, index) => (
                  <label
                    key={index}
                    className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedOption === option
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="voteOption"
                      value={option}
                      checked={selectedOption === option}
                      onChange={(e) => setSelectedOption(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 mr-3 ${
                      selectedOption === option
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-gray-300'
                    }`}>
                      {selectedOption === option && (
                        <div className="w-full h-full rounded-full bg-white transform scale-50"></div>
                      )}
                    </div>
                    <span className={`font-medium ${
                      selectedOption === option ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {option}
                    </span>
                  </label>
                ))}
              </div>
              
              {visibleOptions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>暂无可用的投票选项</p>
                  <p className="text-sm mt-1">请联系管理员设置投票选项</p>
                </div>
              )}
            </div>

            {/* 投票者标识 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                您的标识 *
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={voterId}
                  onChange={(e) => setVoterId(e.target.value)}
                  className="input-field flex-1 max-w-xs"
                  placeholder="输入昵称或编号"
                  required
                />
                <button
                  type="button"
                  onClick={handleGenerateId}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md border border-gray-300 transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>随机生成</span>
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">用于区分不同投票者，保证匿名性。可手动输入或点击随机生成</p>
            </div>

            {/* 消息提示 */}
            {message && (
              <div className={`p-3 rounded-md ${
                message.includes('成功') 
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            {/* 提交按钮 */}
            <div className="flex justify-end space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="vote-button vote-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>提交中...</span>
                  </div>
                ) : (
                  '提交投票'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 已投票提示 */}
      {hasVoted && (
        <div className="vote-card text-center">
          <div className="text-4xl mb-4">✅</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">投票已提交</h3>
          <p className="text-gray-600 mb-4">感谢您的参与！请等待其他人完成投票。</p>
          <p className="text-sm text-gray-500">
            当前进度：{voteCount}/{settings.totalPeople}
          </p>
        </div>
      )}

      {/* 管理员操作 */}
      {voteCount > 0 && (
        <div className="vote-card bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">管理员操作</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleReset}
              className="vote-button vote-button-danger w-auto px-6"
            >
              重置投票
            </button>
            <button
              onClick={handleRefresh}
              className="vote-button vote-button-secondary w-auto px-6"
            >
              刷新页面
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            重置将清除所有投票记录，请谨慎操作
          </p>
        </div>
      )}
    </div>
  );
};

export default VoteInterface;