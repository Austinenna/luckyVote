import React from 'react';

const VoteResults = ({ results, settings, onReset }) => {
  if (!results || !settings) {
    return (
      <div className="vote-card text-center">
        <p className="text-gray-600">暂无投票结果</p>
      </div>
    );
  }

  // 计算总票数
  const totalVotes = Object.values(results).reduce((sum, count) => sum + count, 0);
  
  // 按票数排序
  const sortedResults = Object.entries(results)
    .sort(([, a], [, b]) => b - a)
    .map(([option, count], index) => ({
      option,
      count,
      percentage: totalVotes > 0 ? ((count / totalVotes) * 100).toFixed(1) : 0,
      rank: index + 1
    }));

  // 获取获胜选项
  const winner = sortedResults[0];
  const hasWinner = winner && winner.count > 0;
  const isTie = sortedResults.filter(item => item.count === winner.count).length > 1;

  const handleReset = async () => {
    if (window.confirm('确定要重置投票吗？这将清除所有投票记录并开始新的投票。')) {
      const result = await onReset();
      if (!result.success) {
        alert(result.error || '重置失败');
      }
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* 结果标题 */}
      <div className="vote-card text-center">
        <div className="text-6xl mb-4">
          {hasWinner ? (isTie ? '🤝' : '🏆') : '📊'}
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {hasWinner ? (isTie ? '平局！' : '投票结果') : '投票完成'}
        </h2>
        <p className="text-gray-600">
          总共 {totalVotes} 票 · {settings.totalPeople} 人参与
        </p>
      </div>

      {/* 获胜者展示 */}
      {hasWinner && !isTie && (
        <div className="vote-card bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <div className="text-center">
            <div className="text-4xl mb-3">🥇</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">获胜选项</h3>
            <div className="text-3xl font-bold text-orange-600 mb-2">{winner.option}</div>
            <p className="text-lg text-gray-700">
              {winner.count} 票 ({winner.percentage}%)
            </p>
          </div>
        </div>
      )}

      {/* 平局展示 */}
      {hasWinner && isTie && (
        <div className="vote-card bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">平局选项</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sortedResults
                .filter(item => item.count === winner.count)
                .map((item, index) => (
                  <div key={item.option} className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="text-2xl mb-2">🤝</div>
                    <div className="text-xl font-bold text-blue-600">{item.option}</div>
                    <p className="text-gray-700">
                      {item.count} 票 ({item.percentage}%)
                    </p>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}

      {/* 详细结果 */}
      <div className="vote-card">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">详细结果</h3>
        <div className="space-y-4">
          {sortedResults.map((item, index) => {
            const isWinner = !isTie && index === 0 && item.count > 0;
            const isTieOption = isTie && item.count === winner.count && item.count > 0;
            
            return (
              <div 
                key={item.option} 
                className={`p-4 rounded-lg border-2 transition-all ${
                  isWinner 
                    ? 'border-yellow-300 bg-yellow-50'
                    : isTieOption
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`text-2xl ${
                      isWinner ? '🥇' : 
                      isTieOption ? '🤝' :
                      index === 1 && !isTie ? '🥈' :
                      index === 2 && !isTie ? '🥉' : '📊'
                    }`}>
                      {isWinner ? '🥇' : 
                       isTieOption ? '🤝' :
                       index === 1 && !isTie && sortedResults[1].count > 0 ? '🥈' :
                       index === 2 && !isTie && sortedResults[2].count > 0 ? '🥉' : '📊'}
                    </div>
                    <div>
                      <h4 className={`text-lg font-semibold ${
                        isWinner ? 'text-yellow-800' :
                        isTieOption ? 'text-blue-800' :
                        'text-gray-900'
                      }`}>
                        {item.option}
                      </h4>
                      <p className="text-sm text-gray-600">第 {item.rank} 名</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      isWinner ? 'text-yellow-600' :
                      isTieOption ? 'text-blue-600' :
                      'text-gray-700'
                    }`}>
                      {item.count}
                    </div>
                    <div className="text-sm text-gray-600">
                      {item.percentage}%
                    </div>
                  </div>
                </div>
                
                {/* 进度条 */}
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-1000 ${
                      isWinner ? 'bg-yellow-500' :
                      isTieOption ? 'bg-blue-500' :
                      'bg-gray-400'
                    }`}
                    style={{ 
                      width: `${item.percentage}%`,
                      minWidth: item.count > 0 ? '8px' : '0'
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 统计信息 */}
      <div className="vote-card bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">投票统计</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalVotes}</div>
            <div className="text-sm text-gray-600">总票数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{settings.totalPeople}</div>
            <div className="text-sm text-gray-600">参与人数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{settings.options.length}</div>
            <div className="text-sm text-gray-600">选项数量</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {totalVotes > 0 ? '100%' : '0%'}
            </div>
            <div className="text-sm text-gray-600">参与率</div>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="vote-card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">管理员操作</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleReset}
            className="vote-button vote-button-primary w-auto px-6"
          >
            重置投票
          </button>
          <button
            onClick={handleRefresh}
            className="vote-button vote-button-secondary w-auto px-6"
          >
            刷新页面
          </button>
          <button
            onClick={() => window.print()}
            className="vote-button vote-button-secondary w-auto px-6"
          >
            打印结果
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-3">
          重置投票将清除所有投票记录，请谨慎操作
        </p>
      </div>
    </div>
  );
};

export default VoteResults;