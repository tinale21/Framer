import { Cursor, Chevron, Chat, Moon, GridPlus, People, SearchPlus, ToolbarFrame, ToolbarMonitor, ToolbarLayers } from '../icons';

export default function BottomToolbar() {
  return (
    <div className="bottom-toolbar">
      <div className="bottom-toolbar__cursor">
        <Cursor size={14} />
        <Chevron size={12} />
      </div>
      <button className="toolbar-icon"><Chat /></button>
      <button className="toolbar-icon"><Moon /></button>
      <button className="toolbar-icon"><GridPlus /></button>
      <button className="toolbar-icon"><People /></button>
      <button className="toolbar-icon"><SearchPlus /></button>
      <div className="bottom-toolbar__divider" />
      <button className="toolbar-icon toolbar-icon--active"><ToolbarFrame active /></button>
      <button className="toolbar-icon"><ToolbarMonitor /></button>
      <button className="toolbar-icon"><ToolbarLayers /></button>
    </div>
  );
}
