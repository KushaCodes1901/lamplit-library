import { BookOpen, Footprints, MousePointer2 } from "lucide-react";
import { Modal } from "./Modal";
export function Help({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Library controls" className="help-modal" onClose={onClose}>
      <span className="eyebrow">NO HURRY. NO WRONG TURN.</span>
      <h1>The room is yours.</h1>
      <p className="panel-intro">
        Walk to a shelf, pick a story, and make yourself comfortable.
      </p>
      <div className="help-row">
        <Footprints />
        <div>
          <h2>Take a little wander</h2>
          <p>
            <kbd>W</kbd>
            <kbd>A</kbd>
            <kbd>S</kbd>
            <kbd>D</kbd> or arrow keys to move.
            <br />
            On touch screens, use the direction buttons.
          </p>
        </div>
      </div>
      <div className="help-row">
        <BookOpen />
        <div>
          <h2>Find a story</h2>
          <p>
            <kbd>E</kbd> or <kbd>Enter</kbd> beside a shelf to browse.
            <br />
            The Browse button does the same on touch screens.
          </p>
        </div>
      </div>
      <div className="help-row">
        <MousePointer2 />
        <div>
          <h2>Or let the room guide you</h2>
          <p>
            Click a shelf label to walk there automatically. Browse Books opens
            every story without walking.
          </p>
        </div>
      </div>
      <p className="help-note">
        <kbd>Esc</kbd> returns to the room. Inside a book, use ← and → to turn
        pages. Your place is saved on this device.
      </p>
      <button className="button primary" onClick={onClose}>
        Make yourself at home <span>→</span>
      </button>
    </Modal>
  );
}
