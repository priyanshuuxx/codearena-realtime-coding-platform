function QuestionLock({ children, className = '' }) {
  function blockClipboard(event) {
    event.preventDefault();
  }

  function blockCopyShortcut(event) {
    if ((event.metaKey || event.ctrlKey) && (event.key.toLowerCase() === 'c' || event.key.toLowerCase() === 'x')) {
      event.preventDefault();
    }
  }

  return (
    <div
      className={`question-lock ${className}`}
      onCopy={blockClipboard}
      onCut={blockClipboard}
      onContextMenu={blockClipboard}
      onKeyDown={blockCopyShortcut}
    >
      {children}
    </div>
  );
}

export default QuestionLock;
