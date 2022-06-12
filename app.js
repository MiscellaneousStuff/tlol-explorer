const { ipcRenderer } = require("electron");
const fs = require('fs');
const path = require("path");
const { exec } = require('node:child_process');

const $ = id => { return document.getElementById(id) }

const saveInputs = [
    "options-end_time",
    "options-game_dir",
    "options-dataset_dir",
    "options-scraper_dir",
    "options-db_dir"
];

const setInputs = inputs => {
    inputs.forEach(id => {
        $(id).value = localStorage.getItem(id);
    });
    $("options-replay_speed").value = localStorage.getItem("options-replay_speed");
    $("options-replay_dir").value = localStorage.getItem("options-replay_dir");
}

const scrape = (file, done) => {
    console.log("scrape:", done)
    if (!done) {
        const replaySpeed = localStorage.getItem("options-replay_speed");
        const replayDir   = localStorage.getItem("options-replay_dir");
        const datasetDir  = localStorage.getItem("options-dataset_dir");
        const scraperDir  = localStorage.getItem("options-scraper_dir");
        const gameDir     = localStorage.getItem("options-game_dir");
        const endtime     = localStorage.getItem("options-end_time");

        let gameIdOnly = file.split(".")[0].split("-")[1];

        let execStr = "";
        execStr += "python -m tlol.bin.replay_scraper";
        execStr += ` --replay_idxs "${gameIdOnly}"`;
        execStr += ` --game_dir "${gameDir}"`;
        execStr += ` --scraper_dir "${scraperDir}"`;
        execStr += ` --dataset_dir "${datasetDir}"`;
        execStr += ` --replay_dir "${replayDir}"`;
        execStr += ` --replay_speed ${replaySpeed}`;
        if (endtime)
            execStr += ` --end_time ${endtime}`;
        console.log(execStr);
        exec(execStr, (err, stdout, stderr) => {console.log(stdout)});
    } else {
        alert(`${file} already scraped!`)
    }
}

const convert = (file, done) => {
    console.log("convert:", done)
    if (!done) {
        const jsonDir  = localStorage.getItem("options-dataset_dir");
        const dbDir    = localStorage.getItem("options-db_dir");

        let gameIdOnly = file.split(".")[0].split("-")[1];

        let execStr = "";
        execStr += "python -m tlol.bin.convert_dataset";
        execStr += ` --idxs "${gameIdOnly}"`;
        execStr += ` --json_dir "${jsonDir}"`;
        execStr += ` --db_dir "${dbDir}"`;
        console.log(execStr);
        exec(execStr, (err, stdout, stderr) => {
            console.log(err)
            console.log(stdout)
            updateReplays(localStorage.getItem("options-replay_dir"));
        });
    } else {
        alert(`${file} already converted!`)
    }
}

const jsonExists = file => {
    const jsonDir = localStorage.getItem("options-dataset_dir");
    let fi = file.split(".")[0] + ".json";
    const exists = fs.existsSync(path.join(jsonDir, fi));
    console.log(path.join(jsonDir, fi), exists)
    return exists;
};
const dbExists = file => {
    const dbDir = localStorage.getItem("options-db_dir");
    let fi = file.split(".")[0] + ".db";
    const exists = fs.existsSync(path.join(dbDir, fi));
    console.log(path.join(dbDir, fi), exists)
    return exists;
};

const updateReplays = replayDir => {
    fs.readdir(replayDir, (err, files) => {
        $("replays").innerHTML = "";
        files.forEach(file => {
            const jsonDone = jsonExists(file);
            const dbDone   = dbExists(file);
            const scrapeStyle  = jsonDone ? "style='background-color: green'" : "";
            const convertStyle = dbDone ? "style='background-color: green'" : "";

            $("replays").innerHTML += `
                <div class="replay">
                    <div class="replay-file">
                        ${file.split(".")[0]}
                    </div>
                    <div class="replay-options">
                        <button ${scrapeStyle} onclick="scrape('${file}', ${jsonDone})">
                            Scrape
                        </button>
                        <button ${convertStyle} onclick="convert('${file}', ${dbDone})">
                            Convert
                        </button>
                        <button>
                            View
                        </button>
                    </div>
                </div>
            `;
        });
    });
};

window.onload = () => {
    $("top-close").addEventListener("click", () => {
        console.log("close");
        ipcRenderer.send("close");
    });
    updateReplays(localStorage.getItem("options-replay_dir"));
    saveInputs.forEach(id => {
        $(id).addEventListener("keyup", e => {
            if (e.key == "Enter") {
                localStorage.removeItem(id);
                localStorage.setItem(id, $(id).value);
            }
        })
    });
    $("options-replay_speed").addEventListener("change", e => {
        localStorage.setItem(
            "options-replay_speed",
            $("options-replay_speed").value);
    });
    $("options-replay_dir").addEventListener("change", e => {
        localStorage.setItem(
            "options-replay_dir",
            $("options-replay_dir").value);
        updateReplays(localStorage.getItem("options-replay_dir"));
    });
    setInputs(saveInputs);
};