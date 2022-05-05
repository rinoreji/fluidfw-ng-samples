import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { SharedString } from "fluid-framework";
import {
  ISharedStringHelperTextChangedEventArgs,
  SharedStringHelper,
} from "./SharedStringHelper";

@Component({
  selector: "app-collaborative-text",
  template: `
    <textarea
      #editor
      [value]="content"
      (input)="handleChange($event)"
      (click)="storeSelection()"
      (beforeinput)="storeSelection()"
      (keydown)="storeSelection()"
      (contextmenu)="storeSelection()"
    ></textarea>
  `,
  styles: [],
})
export class CollaborativeTextComponent implements OnInit, OnDestroy {
  content: string = "";
  private sharedStringHelper: SharedStringHelper | undefined;

  private editor: HTMLTextAreaElement | undefined;
  private selectionStartRef: number = 0;
  private selectionEndRef: number = 0;

  @Input("sharedstring")
  set setHelper(shared: SharedString | undefined) {
    if (shared) {
      this.sharedStringHelper = new SharedStringHelper(shared);
      this.sharedStringHelper!.on("textChanged", this.handleTextChanged);
      this.content = this.sharedStringHelper.getText();
    }
  }

  @ViewChild("editor")
  set setEditor(ele: ElementRef<HTMLTextAreaElement>) {
    this.editor = ele.nativeElement;
  }

  constructor() {}

  async ngOnInit() {}

  storeSelection = () => {
    if (!this.editor) {
      throw new Error(
        "Trying to remember selection without current textarea ref?"
      );
    }
    const textareaElement = this.editor;

    const textareaSelectionStart = textareaElement.selectionStart;
    const textareaSelectionEnd = textareaElement.selectionEnd;
    this.selectionStartRef = textareaSelectionStart;
    this.selectionEndRef = textareaSelectionEnd;

    console.log("storeSelection", {
      selectionStartRef: this.selectionStartRef,
      selectionEndRef: this.selectionEndRef,
    });
  };

  setText(txt: string) {
    console.log("setText", txt);
    this.content = txt;
  }

  handleChange = (ev: any) => {
    console.log("handleChange", this.sharedStringHelper!);
    // First get and stash the new textarea state
    if (!this.editor) {
      throw new Error("Handling change without current textarea ref?");
    }
    const textareaElement = this.editor;
    const newText = textareaElement.value;
    // After a change to the textarea content we assume the selection is gone (just a caret)
    // This is a bad assumption (e.g. performing undo will select the re-added content).
    const newCaretPosition = textareaElement.selectionStart;

    // Next get and stash the old state
    const oldText = this.content;
    const oldSelectionStart = this.selectionStartRef;
    const oldSelectionEnd = this.selectionEndRef;

    // Next update the state with the values from the textarea
    this.storeSelection();
    this.setText(newText);

    // Finally update the SharedString with the values after deducing what type of change it was.
    // If the caret moves to the right of the prior left bound of the selection, we assume an insert occurred
    // This is also a bad assumption, in the undo case.
    const isTextInserted = newCaretPosition - oldSelectionStart > 0;
    if (isTextInserted) {
      const insertedText = newText.substring(
        oldSelectionStart,
        newCaretPosition
      );
      const isTextReplaced = oldSelectionEnd - oldSelectionStart > 0;
      if (!isTextReplaced) {
        this.sharedStringHelper!.insertText(insertedText, oldSelectionStart);
      } else {
        this.sharedStringHelper!.replaceText(
          insertedText,
          oldSelectionStart,
          oldSelectionEnd
        );
      }
    } else {
      // Text was removed
      const charactersDeleted = oldText.length - newText.length;
      this.sharedStringHelper!.removeText(
        newCaretPosition,
        newCaretPosition + charactersDeleted
      );
    }
  };

  setTextareaSelection = (newStart: number, newEnd: number) => {
    console.log("setTextareaSelection", newStart, newEnd);
    if (!this.editor) {
      throw new Error("Trying to set selection without current textarea ref?");
    }
    const textareaElement = this.editor;

    textareaElement.selectionStart = newStart;
    textareaElement.selectionEnd = newEnd;
  };

  handleTextChanged = (event: ISharedStringHelperTextChangedEventArgs) => {
    console.log("handleTextChanged", event);
    const newText = this.sharedStringHelper!.getText();
    this.setText(newText);

    // If the event was our own then the caret will already be in the new location.
    // Otherwise, transform our selection position based on the change.
    if (!event.isLocal) {
      const newSelectionStart = event.transformPosition(this.selectionStartRef);
      const newSelectionEnd = event.transformPosition(this.selectionEndRef);
      this.setTextareaSelection(newSelectionStart, newSelectionEnd);
      this.storeSelection();
    }
  };

  async ngOnDestroy() {
    this.sharedStringHelper!.off("textChanged", this.handleTextChanged);
  }
}
