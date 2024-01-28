import { gameModeChanged } from "./app.js";
export class guiHandler {

    static gameMode = null;  // static variable gameMode
    static gui;   // only one dynamic texture is required in our case

    createButtons() {

        // Using stack panel control to effectively handle equal spacing of mode buttons
        const stackPanel = new BABYLON.GUI.StackPanel();
        stackPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        stackPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        stackPanel.isVertical = false;
        stackPanel.setPadding('100px', '0px', '0px', '100px');
        stackPanel.height = 0.2;
        stackPanel.width = 1;
        stackPanel.spacing = 40;
        stackPanel.color = 'white';

        // Add the StackPanel to the GUI
        guiHandler.gui.addControl(stackPanel);
        this.addButton("DRAW", "Draw Meshes", stackPanel);
        this.addButton("EXTRUDE", "Extrude Meshes", stackPanel);
        this.addButton("MOVE", "Move Meshes", stackPanel);
        this.addButton("UPDATE_VERTICES", "Play With Vertices", stackPanel);
    };

    addButton(name, text, stackPanel) {
        const button = BABYLON.GUI.Button.CreateSimpleButton(name, text);
        button.height = '200px';
        button.width = '200px';
        button.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        button.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        button.color = "#000";
        button.background = "#eab9fe";
        button.fontFamily = "PT Sans";
        button.fontSize = 36;
        button.fontWeight = 'Bold';
        button.shadowColor = '#f8eaff';
        button.shadowOffsetX = 1;
        button.shadowOffsetY = 1;

        // Attach event handlers

        // triggered when cursor is over the button
        button.onPointerEnterObservable.add(() => this.pointerEnter(button));

        // triggered when button is clicked ( pointer released after pressing)
        button.onPointerClickObservable.add(() => this.handleButtonClick(button));

        // triggered when cursor moves out of the domain of button
        button.onPointerOutObservable.add(() => this.pointerOut(button));

        // Add button to GUI
        stackPanel.addControl(button);
    };

    pointerEnter(currButton) {
        currButton.height = '300px';
        currButton.width = '300px';
        currButton.background = "#e7b1fe";
        currButton.fontSize = 48;
    };


    pointerOut(currButton) {
        if (guiHandler.gameMode != currButton.name) {
            currButton.height = '200px';
            currButton.width = '200px';
            currButton.fontSize = 36;
            currButton.background = "#eab9fe";
        }
    };

    handleButtonClick(currButton) {

        // get button clicked previously for a particular game mode if any and restore its style 
        if (guiHandler.gameMode) {
            const prevButton = guiHandler.gui.getControlByName(guiHandler.gameMode);
            if (prevButton) {
                prevButton.height = '200px';
                prevButton.width = '200px';
                prevButton.fontSize = '200px';
                prevButton.background = "#eab9fe";
                prevButton.color = '#000';
                prevButton.fontSize = 36;

            }
        }

        // change the game mode and appearance of button to highlight it.
        guiHandler.gameMode = currButton.name;
        currButton.color = 'red';
        console.log(guiHandler.gameMode);

        // notifiying our main app.js class about the change
        gameModeChanged();
    };

};