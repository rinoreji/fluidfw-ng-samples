import { IFluidContainer, SharedMap, SharedString } from "fluid-framework";

export const ID_PREFIX = "NOTE_ID";
export const TEXT_PREFIX = "NOTE_TEXT";

export type NoteModel = {
  noteId: string | undefined;
  noteText: string | undefined;
  updateNote(noteId: string, noteText: string): void;
  onChange(
    noteId: string | undefined,
    noteText: string | undefined,
    event: any
  ): void;
};

export class Board {
  private _notes: Array<NoteModel> = [];
  public get notes(): Array<NoteModel> {
    return this._notes;
  }

  constructor(private fluidContainer: IFluidContainer) {
    this.refresh();
  }

  addNote = (id: string, text: string | undefined) => {
    createNote(this.fluidContainer, id, text);
  };

  removeNote = (id: string) => {
    let notesMap = this.fluidContainer.initialObjects[
      "sharedNotesMap"
    ] as SharedMap;
    notesMap.delete(ID_PREFIX + "_" + id);
    notesMap.delete(`${TEXT_PREFIX}_${id}`);
  };

  removeAll = () => {
    let notesMap = this.fluidContainer.initialObjects[
      "sharedNotesMap"
    ] as SharedMap;
    notesMap.clear();
    this.refresh();
    // this._notes.length = 0;
  };

  refresh = () => {
    let notesMap = this.fluidContainer.initialObjects[
      "sharedNotesMap"
    ] as SharedMap;
    let notesIds = Array.from(notesMap.keys())
      .filter((k) => k.includes(ID_PREFIX))
      .map((key) => key.substring(ID_PREFIX.length + 1));
    this._notes.length = 0;
    notesIds.forEach(async (id) => {
      let noteText = notesMap.get(`${TEXT_PREFIX}_${id}`);
      this._notes.push(createNote(this.fluidContainer, id, noteText));
    });
  };
}

function createNote(
  fluidContainer: IFluidContainer,
  noteId: string,
  noteText: string | undefined
): NoteModel {
  var note: NoteModel = {
    noteId: noteId,
    noteText: noteText,
    updateNote: (id, text) => setOrUpdateNoteMap(fluidContainer, id, text),
    onChange: (id, text, evt) => {
      console.log(id, text, evt);
      // updateText(fluidContainer, id!, text);
    },
  };
  setOrUpdateNoteMap(fluidContainer, noteId, noteText);

  return note;
}

async function setOrUpdateNoteMap(
  fluidContainer: IFluidContainer,
  noteId: string,
  noteText: string | undefined
) {
  let notesMap = fluidContainer.initialObjects["sharedNotesMap"] as SharedMap;
  let keyExists = notesMap.has(`${ID_PREFIX}_${noteId}`);
  if (!keyExists) {
    notesMap.set(`${ID_PREFIX}_${noteId}`, noteId);
    notesMap.set(`${TEXT_PREFIX}_${noteId}`, noteText);
  } else {
  }
}

async function updateText(
  fluidContainer: IFluidContainer,
  noteId: string,
  noteText: string | undefined
) {
  let notesMap = fluidContainer.initialObjects["sharedNotesMap"] as SharedMap;
  let keyExists = notesMap.has(`${ID_PREFIX}_${noteId}`);
  if (!keyExists) {
    notesMap.set(`${ID_PREFIX}_${noteId}`, noteId);
  } else {
    const sharedNoteTextHandle = notesMap.get(`${TEXT_PREFIX}_${noteId}`);
    const sharedNoteText:SharedString = await sharedNoteTextHandle.get();
    sharedNoteText.insertText(0, noteText!);
  }
}
