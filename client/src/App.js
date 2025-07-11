import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VoteSettings from './components/VoteSettings';
import VoteInterface from './components/VoteInterface';
import VoteResults from './components/VoteResults';

function App() {
  const [voteData, setVoteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('vote'); // 'vote', 'settings', 'results'
  const [previousVotingStatus, setPreviousVotingStatus] = useState(false); // 跟踪之前的投票状态

  // 获取投票状态
  const fetchVoteStatus = async (isPolling = false) => {
    try {
      if (!isPolling) setLoading(true);
      const response = await axios.get('/api/vote-status');
      const newVoteData = response.data;
      
      // 检查投票是否刚刚完成
      if (!previousVotingStatus && newVoteData.isVotingComplete) {
        // 投票刚刚完成，刷新页面数据并停止轮询
        setVoteData(newVoteData);
        setPreviousVotingStatus(newVoteData.isVotingComplete);
        setCurrentView('vote'); // 保持在投票页面显示完成结果
        
        // 显示投票完成通知
        if (window.Notification && Notification.permission === 'granted') {
          new Notification('投票已完成！', {
            body: '所有人都已完成投票，查看结果吧！',
            icon: '/favicon.ico'
          });
        }
        
        // 投票完成后停止轮询
        return true; // 返回true表示需要停止轮询
      } else if (isPolling && !newVoteData.isVotingComplete) {
        // 轮询期间且投票未完成，只更新投票计数，不刷新整个页面
        if (voteData && voteData.votes && Object.keys(newVoteData.votes).length !== Object.keys(voteData.votes).length) {
          setVoteData(prev => ({
            ...prev,
            votes: newVoteData.votes
          }));
        }
      } else if (!isPolling) {
        // 非轮询情况下正常更新数据
        setVoteData(newVoteData);
        setPreviousVotingStatus(newVoteData.isVotingComplete);
      }
      
      setError(null);
      return false; // 返回false表示继续轮询
    } catch (err) {
      if (!isPolling) {
        setError('获取投票状态失败');
        console.error('Error fetching vote status:', err);
      }
      return false;
    } finally {
      if (!isPolling) setLoading(false);
    }
  };

  // 更新设置
  const updateSettings = async (settings) => {
    try {
      const response = await axios.post('/api/settings', settings);
      setVoteData(response.data.data);
      setCurrentView('vote');
      return { success: true };
    } catch (err) {
      console.error('Error updating settings:', err);
      return { success: false, error: '保存设置失败' };
    }
  };

  // 提交投票
  const submitVote = async (voterId, selectedOption) => {
    try {
      const response = await axios.post('/api/vote', {
        voterId,
        selectedOption
      });
      setVoteData(response.data.data);
      return { success: true };
    } catch (err) {
      console.error('Error submitting vote:', err);
      return { success: false, error: err.response?.data?.error || '投票失败' };
    }
  };

  // 重置投票
  const resetVote = async () => {
    try {
      const response = await axios.post('/api/reset');
      setVoteData(response.data.data);
      setPreviousVotingStatus(false); // 重置投票状态跟踪
      setCurrentView('vote');
      return { success: true };
    } catch (err) {
      console.error('Error resetting vote:', err);
      return { success: false, error: '重置失败' };
    }
  };

  useEffect(() => {
    // 请求通知权限
    if (window.Notification && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    fetchVoteStatus();
    
    let pollInterval;
    
    // 设置轮询，每3秒检查一次投票状态
    const startPolling = () => {
      pollInterval = setInterval(async () => {
        // 只有在页面可见且投票未完成时才轮询
        if (!document.hidden && (!voteData || !voteData.isVotingComplete)) {
          const shouldStop = await fetchVoteStatus(true);
          if (shouldStop) {
            clearInterval(pollInterval);
          }
        }
      }, 3000);
    };
    
    // 只有在投票未完成时才开始轮询
    if (!voteData || !voteData.isVotingComplete) {
      startPolling();
    }
    
    // 页面可见性变化时的处理
    const handleVisibilityChange = () => {
      if (!document.hidden && (!voteData || !voteData.isVotingComplete)) {
        fetchVoteStatus();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // 清理定时器和事件监听器
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [voteData?.isVotingComplete, previousVotingStatus]); // 添加previousVotingStatus作为依赖项

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchVoteStatus}
            className="vote-button vote-button-primary"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">🧧 红包局投票</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentView('vote')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'vote'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                投票
              </button>
              <button
                onClick={() => setCurrentView('settings')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'settings'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                设置
              </button>
              {voteData?.isVotingComplete && (
                <button
                  onClick={() => setCurrentView('results')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'results'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  结果
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {currentView === 'vote' && (
          <VoteInterface
            voteData={voteData}
            onSubmitVote={submitVote}
            onReset={resetVote}
          />
        )}
        {currentView === 'settings' && (
          <VoteSettings
            settings={voteData?.settings}
            onUpdateSettings={updateSettings}
          />
        )}
        {currentView === 'results' && voteData?.isVotingComplete && (
          <VoteResults
            results={voteData.results}
            settings={voteData.settings}
            onReset={resetVote}
          />
        )}
      </main>
    </div>
  );
}

export default App;