import { IFluidContainer, SharedMap, SharedString } from "fluid-framework";

export const ID_PREFIX = "NOTE_ID";
// export const TEXT_PREFIX = "NOTE_TEXT";
export const STEXT_PREFIX = "SHARED_NOTE_TEXT";

export type NoteModel = {
  noteId: string | undefined;
  // noteText: string | undefined;
  noteSText: SharedString | undefined;
};

export class Board {
  private _notes: Array<NoteModel> = [];
  public get notes(): Array<NoteModel> {
    return this._notes;
  }

  constructor(private fluidContainer: IFluidContainer) {
    // this.refresh();
  }

  addNote = async (id: string, text: string | undefined) => {
    await createNote(this.fluidContainer, id, text);
  };

  removeNote = (id: string) => {
    let notesMap = this.fluidContainer.initialObjects[
      "sharedNotesMap"
    ] as SharedMap;
    notesMap.delete(ID_PREFIX + "_" + id);
    // notesMap.delete(`${TEXT_PREFIX}_${id}`);
  };

  removeAll = () => {
    let notesMap = this.fluidContainer.initialObjects[
      "sharedNotesMap"
    ] as SharedMap;
    notesMap.clear();
  };

  refresh = async () => {
    let d= Date.now();
    let notesMap = this.fluidContainer.initialObjects[
      "sharedNotesMap"
    ] as SharedMap;
    let notesIds = Array.from(notesMap.keys())
      .filter((k) => k.includes(ID_PREFIX))
      .map((key) => key.substring(ID_PREFIX.length + 1));
    const notes:Array<NoteModel>=[];
    console.log("notes a",d, notesIds, notes);
    for (const id of notesIds) {      
      // if(this._notes.findIndex(n=>n.noteId === id) < 0)
      notes.push(await getNote(this.fluidContainer, id));
    }
    console.log("notes b",d, notesIds, notes);
    this._notes = notes;
  };
}

async function createNote(
  fluidContainer: IFluidContainer,
  noteId: string,
  noteText: string | undefined
):Promise<NoteModel> {
  console.log("createNote");
  var note: NoteModel = {
    noteId: noteId,
    // noteText: noteText,
    noteSText: undefined
  };
  await setOrUpdateNoteMap(fluidContainer, noteId);
  // note.noteSText = await getSharedNoteText(fluidContainer,noteId)
  return note;
}

async function getNote(
  fluidContainer: IFluidContainer,
  noteId: string
): Promise<NoteModel> {
  var note: NoteModel = {
    noteId: noteId,
    // noteText: undefined,
    noteSText: undefined,
  };
  note.noteSText = await getSharedNoteText(fluidContainer, noteId);
  console.log("getNote", note);
  return note;
}

async function getSharedNoteText(
  fluidContainer: IFluidContainer,
  noteId: string
): Promise<SharedString | undefined> {
  let notesMap = fluidContainer.initialObjects["sharedNotesMap"] as SharedMap;
  if (notesMap.has(`${STEXT_PREFIX}_${noteId}`)) {
    // return notesMap.get(`${TEXT_PREFIX}_${noteId}`);
    let handle = notesMap.get(`${STEXT_PREFIX}_${noteId}`);
    return await handle.get();
  }
  return undefined;
}

async function setOrUpdateNoteMap(
  fluidContainer: IFluidContainer,
  noteId: string
  // , noteText: string | undefined
) {
  let notesMap = fluidContainer.initialObjects["sharedNotesMap"] as SharedMap;
  let keyExists = notesMap.has(`${ID_PREFIX}_${noteId}`);
  if (!keyExists) {
    // notesMap.set(`${TEXT_PREFIX}_${noteId}`, noteText);
    const sText = await fluidContainer.create(SharedString);
    notesMap.set(`${STEXT_PREFIX}_${noteId}`, sText.handle);
    notesMap.set(`${ID_PREFIX}_${noteId}`, noteId);
    // notesMap.set(`${TEXT_PREFIX}_${noteId}`, noteText);
  }
}
