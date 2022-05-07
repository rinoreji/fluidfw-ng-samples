import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  AzureClient,
  LOCAL_MODE_TENANT_ID,
} from "@fluidframework/azure-client";
import { InsecureTokenProvider } from "@fluidframework/test-client-utils";
import {
  ContainerSchema,
  IFluidContainer,
  SharedMap,
  SharedString,
} from "fluid-framework";
import { Board, NoteModel } from "./NoteModel";

const serviceConfig = {
  connection: {
    tenantId: LOCAL_MODE_TENANT_ID, // REPLACE WITH YOUR TENANT ID
    tokenProvider: new InsecureTokenProvider(
      "" /* REPLACE WITH YOUR PRIMARY KEY */,
      { id: "userId" }
    ),
    orderer: "http://localhost:7070", // REPLACE WITH YOUR ORDERER ENDPOINT
    storage: "http://localhost:7070", // REPLACE WITH YOUR STORAGE ENDPOINT
  },
};

@Component({
  selector: "app-sticky-notes",
  templateUrl: "./sticky-notes.component.html",
  styleUrls: ["./sticky-notes.component.css"],
})
export class StickyNotesComponent implements OnInit, OnDestroy {
  sharedNotesMap: SharedMap | undefined;
  updateBoard: ((data: any, islocal: boolean) => void) | undefined;
  board: Board | undefined;
  container: IFluidContainer | undefined;
  sharedString: SharedString | undefined;

  get Notes(): Array<NoteModel> {
    if (this.board!) return this.board!.notes;
    return [];
  }

  async ngOnInit() {
    this.sharedNotesMap = await this.getFluidData();
    this.board = new Board(this.container!);
    this.sharedString = this.container?.initialObjects[
      "sharedString"
    ] as SharedString;
    await this.syncData();
  }

  async getFluidData() {
    // TODO 1: Configure the container.
    const client = new AzureClient(serviceConfig);
    const schema: ContainerSchema = {
      initialObjects: {
        sharedNotesMap: SharedMap,
        sharedString: SharedString,
      },
      dynamicObjectTypes: [SharedString],
    };

    await client.createContainer(schema);

    // TODO 2: Get the container from the Fluid service.
    let container;
    const containerId = location.hash.substring(1);
    if (!containerId) {
      ({ container } = await client.createContainer(schema));
      const id = await container.attach();
      location.hash = id;
    } else {
      ({ container } = await client.getContainer(containerId, schema));
    }

    // TODO 3: Return the Fluid timestamp object.
    this.container = container;
    return container.initialObjects["sharedNotesMap"] as SharedMap;
  }

  async syncData() {
    // Only sync if the Fluid SharedMap object is defined.
    if (this.sharedNotesMap) {
      // TODO 4: Set the value of the localTimestamp state object that will appear in the UI.
      this.updateBoard = async (data: any, islocal: boolean) => {
        console.log("updateBoard", data, islocal);
        // if(!islocal)
        await this.board!.refresh();
      };

      await this.board!.refresh();

      // TODO 5: Register handlers.
      this.sharedNotesMap!.on("valueChanged", this.updateBoard!);
      this.sharedNotesMap!.on("clear", this.updateBoard!);
    }
  }

  async onAddClick() {
    const NOTE_ID = Date.now().toString();
    await this.board?.addNote(NOTE_ID, `Dummy data ${Date.now().toString()}`);
  }
  onClearClick() {
    this.board?.removeAll();
  }

  ngOnDestroy() {
    // Delete handler registration when the Angular App component is dismounted.
    this.sharedNotesMap!.off("valueChanged", this.updateBoard!);
    this.sharedNotesMap!.off("clear", this.updateBoard!);
  }
}
