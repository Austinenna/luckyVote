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

  // 获取投票状态
  const fetchVoteStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/vote-status');
      setVoteData(response.data);
      setError(null);
    } catch (err) {
      setError('获取投票状态失败');
      console.error('Error fetching vote status:', err);
    } finally {
      setLoading(false);
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
      setCurrentView('vote');
      return { success: true };
    } catch (err) {
      console.error('Error resetting vote:', err);
      return { success: false, error: '重置失败' };
    }
  };

  useEffect(() => {
    fetchVoteStatus();
  }, []);

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