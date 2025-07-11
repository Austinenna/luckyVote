import React, { useState, useEffect } from 'react';

const VoteSettings = ({ settings, onUpdateSettings }) => {
  const [totalPeople, setTotalPeople] = useState(5);
  const [options, setOptions] = useState(['选项1', '选项2']);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (settings) {
      setTotalPeople(settings.totalPeople);
      setOptions([...settings.options]);
    }
  }, [settings]);

  const handleAddOption = () => {
    setOptions([...options, `选项${options.length + 1}`]);
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (totalPeople < 1 || totalPeople > 20) {
      setMessage('人数必须在1-20之间');
      return;
    }
    
    if (options.length < 2) {
      setMessage('至少需要2个选项');
      return;
    }
    
    if (options.some(option => !option.trim())) {
      setMessage('选项不能为空');
      return;
    }
    
    setLoading(true);
    setMessage('');
    
    const result = await onUpdateSettings({
      totalPeople: parseInt(totalPeople),
      options: options.filter(option => option.trim())
    });
    
    setLoading(false);
    
    if (result.success) {
      setMessage('设置保存成功！');
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage(result.error || '保存失败');
    }
  };

  return (
    <div className="vote-card max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">投票设置</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 人数设置 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            参与人数
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={totalPeople}
            onChange={(e) => setTotalPeople(e.target.value)}
            className="input-field max-w-xs"
            required
          />
          <p className="text-sm text-gray-500 mt-1">设置参与投票的总人数（1-20人）</p>
        </div>

        {/* 选项设置 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            投票选项
          </label>
          <div className="space-y-3">
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-3">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="input-field flex-1"
                  placeholder={`选项${index + 1}`}
                  required
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                    title="删除选项"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <button
            type="button"
            onClick={handleAddOption}
            className="mt-3 flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>添加选项</span>
          </button>
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
                <span>保存中...</span>
              </div>
            ) : (
              '保存设置'
            )}
          </button>
        </div>
      </form>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <h3 className="text-sm font-medium text-blue-900 mb-2">💡 使用说明</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 修改设置后会自动重置当前投票状态</li>
          <li>• 建议在开始投票前先设置好所有选项</li>
          <li>• 设置会自动保存，下次打开网站直接使用</li>
        </ul>
      </div>
    </div>
  );
};

export default VoteSettings;