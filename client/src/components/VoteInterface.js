import React, { useState } from 'react';

const VoteInterface = ({ voteData, onSubmitVote, onReset }) => {
  const [selectedOption, setSelectedOption] = useState('');
  const [voterId, setVoterId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [hasVoted, setHasVoted] = useState(false);

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

  // 如果投票已完成，显示结果预览
  if (isVotingComplete) {
    return (
      <div className="space-y-6">
        <div className="vote-card text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">投票已完成！</h2>
          <p className="text-gray-600 mb-6">所有 {settings.totalPeople} 人都已投票完成</p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">投票结果</h3>
            <div className="space-y-3">
              {Object.entries(results).map(([option, count]) => {
                const percentage = ((count / settings.totalPeople) * 100).toFixed(1);
                return (
                  <div key={option} className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{option}</span>
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
            {/* 投票者标识 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                您的标识 *
              </label>
              <input
                type="text"
                value={voterId}
                onChange={(e) => setVoterId(e.target.value)}
                className="input-field max-w-xs"
                placeholder="输入昵称或编号"
                required
              />
              <p className="text-sm text-gray-500 mt-1">用于区分不同投票者，保证匿名性</p>
            </div>

            {/* 选项列表 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                选择选项 *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {settings.options.map((option, index) => (
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
          <button
            onClick={handleReset}
            className="vote-button vote-button-danger"
          >
            重置投票
          </button>
          <p className="text-sm text-gray-500 mt-2">
            重置将清除所有投票记录，请谨慎操作
          </p>
        </div>
      )}
    </div>
  );
};

export default VoteInterface;