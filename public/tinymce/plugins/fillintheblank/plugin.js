tinymce.PluginManager.add('fillintheblank', function(editor) {
  var placeholders = [];

  // 创建占位符元素
  function createPlaceholder(id) {
    var span = document.createElement('span');
    span.innerHTML = '<span class="fillintheblank-inner">(____)</span>';
    span.setAttribute('contenteditable', 'false'); // 设置为不可编辑
    span.setAttribute('data-mce-bogus', '1'); // 设置为 Bogus 元素
    span.setAttribute('class', 'mceNonEditable fillintheblank-placeholder'); // 添加 CSS 类
    span.setAttribute('data-id', id); // 添加占位符 ID
    span.setAttribute('data-mce-type', 'placeholder'); // 添加 mce 类型
    return span; // 返回 DOM 元素
  }

  // 插入占位符
  function insertPlaceholder() {
    // 寻找下一个可用的ID
    let nextId = placeholders.length + 1;
    for (let i = 0; i < placeholders.length; i++) {
      if (!placeholders[i]) {
        nextId = i + 1;
        break;
      }
    }

    var placeholder = createPlaceholder(nextId);
    editor.insertContent(placeholder.outerHTML); // 插入 HTML 字符串
    placeholders[nextId - 1] = editor.dom.select('span[data-id="' + nextId + '"]')[0];

    // 更新所有占位符的ID
    updatePlaceholdersId();
  }

  // 删除占位符
  function removePlaceholder(e) {
    var el = e.target;
    if (el.classList.contains('fillintheblank-placeholder')) {
      var index = el.getAttribute('data-id');
      editor.selection.select(el);
      editor.execCommand('mceRemove');

      // 从数组中移除该占位符
      placeholders[index - 1] = null;

      // 更新所有占位符的ID
      updatePlaceholdersId();
    }
  }

  // 更新所有占位符的ID
  function updatePlaceholdersId() {
    let currentId = 1;
    placeholders.forEach(function(placeholder, index) {
      if (placeholder) {
        placeholder.setAttribute('data-id', currentId);
        currentId++;
      }
    });

    // 移除数组中的空元素
    placeholders = placeholders.filter(Boolean);
  }

  // 获取所有占位符
  function getPlaceholders() {
    var placeholderElements = editor.dom.select('span[data-mce-type="placeholder"]');
    return placeholderElements.map((el, index) => ({
      id: index + 1,
      value: editor.dom.getAttrib(el, 'data-id')
    }));
  }

  // 注册按钮
  editor.ui.registry.addButton('fillintheblank', {
    text: '插入填空项',
    onAction: insertPlaceholder
  });

  // 注册菜单项
  editor.ui.registry.addMenuItem('getPlaceholders', {
    text: 'Get Placeholders',
    onAction: function() {
      editor.execCommand('getPlaceholders');
    }
  });

  // 注册命令
  editor.addCommand('getPlaceholders', function() {
    console.log(getPlaceholders());
  });

  // 绑定删除事件
  editor.on('click', removePlaceholder);

  // 监听键盘删除事件
  editor.on('keydown', function(e) {
    if (e.keyCode === 8 || e.keyCode === 46) { // Backspace or Delete key
      var selectedElements = editor.selection.getContent();
      var placeholderElements = editor.dom.select('span[data-mce-type="placeholder"]');
      placeholderElements.forEach(function(placeholder) {
        if (selectedElements.includes(placeholder.outerHTML)) {
          var index = placeholder.getAttribute('data-id');
          placeholders[index - 1] = null;
          editor.selection.select(placeholder);
          editor.execCommand('mceRemove');
          updatePlaceholdersId();
        }
      });
    }
  });

  // 清理函数
  editor.on('remove', function() {
    editor.off('click', removePlaceholder);
    editor.off('keydown');
  });

  // 暴露获取占位符数量的方法
  window.getFillInTheBlankPlaceholders = function() {
    return getPlaceholders();
  };
});
