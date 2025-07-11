import React, { useState, useEffect } from 'react';

const VoteSettings = ({ settings, onUpdateSettings }) => {
  const [totalPeople, setTotalPeople] = useState(5);
  const [options, setOptions] = useState([
    { text: '选项1', visible: true },
    { text: '选项2', visible: true }
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (settings) {
      setTotalPeople(settings.totalPeople);
      // 兼容旧格式：如果是字符串数组，转换为对象数组
      if (settings.options && settings.options.length > 0) {
        if (typeof settings.options[0] === 'string') {
          setOptions(settings.options.map(option => ({ text: option, visible: true })));
        } else {
          setOptions([...settings.options]);
        }
      }
    }
  }, [settings]);

  const handleAddOption = () => {
    setOptions([...options, { text: `选项${options.length + 1}`, visible: true }]);
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], text: value };
    setOptions(newOptions);
  };

  const handleToggleVisibility = (index) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], visible: !newOptions[index].visible };
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
    
    if (options.some(option => !option.text.trim())) {
      setMessage('选项不能为空');
      return;
    }

    const visibleOptions = options.filter(option => option.visible);
    if (visibleOptions.length < 2) {
      setMessage('至少需要2个可见选项');
      return;
    }
    
    setLoading(true);
    setMessage('');
    
    const result = await onUpdateSettings({
      totalPeople: parseInt(totalPeople),
      options: options.filter(option => option.text.trim())
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
              <div key={index} className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all ${
                option.visible 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 bg-gray-50 opacity-60'
              }`}>
                <div className="flex items-center space-x-2 flex-1">
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className={`input-field flex-1 ${
                      option.visible ? '' : 'bg-gray-100 text-gray-500'
                    }`}
                    placeholder={`选项${index + 1}`}
                    required
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* 显示/隐藏切换按钮 */}
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility(index)}
                    className={`p-2 rounded-md transition-colors ${
                      option.visible
                        ? 'text-green-600 hover:text-green-800 hover:bg-green-100'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                    }`}
                    title={option.visible ? '隐藏选项' : '显示选项'}
                  >
                    {option.visible ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    )}
                  </button>
                  
                  {/* 删除按钮 */}
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
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={handleAddOption}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>添加选项</span>
            </button>
            
            <div className="text-sm text-gray-600">
              可见选项: {options.filter(option => option.visible).length} / {options.length}
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mt-2">
            💡 隐藏的选项不会在投票时显示，但会保留在设置中
          </p>
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