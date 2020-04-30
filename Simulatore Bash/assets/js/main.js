(function () {

    /* ***** variabili e costanti globali ***** */

    var name = "";
    var historyArray = [];
    var historyIndex = 0;
    var tab = false;
    const TAB = "&nbsp;&nbsp;&nbsp;&nbsp;";
    var variables = {};   

    /* ***** funzioni di supporto ***** */

    var commandRow = (name, value = "") => {
        return `<div class="row command-row">
                        <div class="command-col col-md-12">
                            <div class="sign-container"><span class="username">` + name + `@trollerbian</span><span class="colon">:</span><span class="path">~ </span><span class="dollar"> $</span></div>                    
                            <div class="input-container"><input class="custom-command-input" name="command" type="text" value="` + value + `"></div>                   
                        </div>
                    </div>`;
    }

    var setName = `<div class="row command-row">
                    <div class="command-col col-md-12">
                        <div class="sign-container">Il tuo nome:</div>                    
                        <div class="input-container"><form class="custom-name-form" id="set-name"><input class="custom-command-input" name="name" type="text" maxlength="20" size="20" autofocus></div></form>                   
                    </div>
                </div>`

    var fileSystemError = () => { return "<div class='common-text'>bash: comando alquanto inutile, non ti aspettavi esistesse davvero un file system :)"; }

    function setFocusCurrentInput() {
        let inputs = document.querySelectorAll('.custom-command-input');
        inputs[inputs.length - 1].focus();
    }

    function getOldCommand(input) {
        if (historyIndex > 0) {
            input.value = historyArray[--historyIndex];
        }
    }

    function getNextCommand(input) {
        if (historyIndex < historyArray.length - 1)
            input.value = historyArray[++historyIndex];
        else if (historyIndex == historyArray.length - 1) {
            historyIndex++;
            input.value = "";
        }
    }

    /* ***** strutture dati ***** */

    var commandsList = {
        clear: "<span class='yellow'>clear</span> - Pulisce lo spazio di lavoro della bash.",
        credits: "<span class='yellow'>credits</span> - autore di questa demo.",
        echo: "<span class='yellow'>echo</span> - Stampa la stringa inserita.",
        help: "<span class='yellow'>help</span> <span class='orange'>[-f/--filter argomento]</span> - Fornisce la lista dei comandi, accetta 1 parametro per filtrare la lista dei comandi.",
        history: "<span class='yellow'>history</span> <span class='orange'>[-c/--clear]</span> - restituisce lo storico dei comandi.",
        mkvar: "<span class='yellow'>mkvar</span> <span class='orange'>-n/--name nome -t/--type tipo -v/--value valore</span> - imposta una variabile di memoria del tipo e valore digitati.",
        pwd: "<span class='yellow'>pwd</span> - Restituisce il path della cartella attuale.",
        rmvar: "<span class='yellow'>rmvar</span> <span class='orange'>[-a/--all] [-n/--name nome]</span> - rimuove le variabili settate.",
        swvar: "<span class='yellow'>swvar</span> <span class='orange'>[-n/--name nome]</span> - mostra le variabili settate, è possibile filtrare per nome.",
        whoami: "<span class='yellow'>whoami</span> - Restituisce il nome utente.",

        // sum: "<span class='yellow'>sum</span> <span class='orange'>arg1 arg2 ...</span> - effettua la somma di una sequenza di variabili, prende in input il nome delle stesse.",
        // sub: "<span class='yellow'>sub</span> <span class='orange'>arg1 arg2 ...</span> - effettua la sottrazione di una sequenza di variabili, prende in input il nome delle stesse.",
        // mul: "<span class='yellow'>mul</span> <span class='orange'>arg1 arg2 ...</span> - effettua il prodotto di una sequenza di variabili, prende in input il nome delle stesse.",
        // div: "<span class='yellow'>div</span> <span class='orange'>arg1 arg2 ...</span> - effettua la divisione di una sequenza di variabili, prende in input il nome delle stesse.",

        cp: "",
        cd: "",
        ls: "",
        mkdir: "",
        touch: "",
        rm: "",
        rmdir: "",
        webprogramming: "",
        mario: ""
    }

    var commandsFunctions = {
        clear: (parameters) => {
            if (parameters) {
                return "<div class='common-text'>bash: il comando 'clear' non richiede parametri.</div>";
            } else {
                document.getElementById("bash-container").innerHTML = "";
                return "";
            }
        },
        credits: (parameters) => {
            return "<div class='common-text'>bash: realizzato da Danilo Santitto, <a href='https://github.com/Warcreed/Progetti-universitari/tree/master/Simulatore%20Bash' target='_blanc'>Github</a></div>";
        },
        echo: (parameters) => {
            if (parameters) {
                return "<div class='common-text'>" + parameters + "</div>";
            } else {
                return "<div class='common-text'>bash: Il comando 'echo' richiede almeno un parametro </div>";
            }
        },
        help: (parameters) => {
            let response = "<div class='common-text'>";
            if (parameters) {
                parameters = parameters.split(' ');
                for (index in parameters) {
                    if (parameters[index] == '-f' || parameters[index] == '--filter') {
                        response += `<div> Ecco la lista dei comandi che contengono la stringa inserita:</div><ul>`;
                        for (command in commandsList)
                            if (commandsList[command] && command.includes(parameters[parseInt(index) + 1]))
                                response += '<li>' + commandsList[command] + '</li>';
                    }
                }
            } else {
                response += `<div> <p>L'autocompletamento è simulato dal tasto 'ctrl'. Inoltre, questi comandi nella lista potrebbero non essere i soli presenti... :)</p></div>`;
                response += `<div> Ecco la lista completa dei comandi:</div>
                   <ul>`;
                for (command in commandsList) {
                    if (commandsList[command])
                        response += '<li>' + commandsList[command] + '</li>';
                }
            }
            response += '</ul></div>';
            return response;
        },
        history: (parameters) => {
            if (parameters) {
                parameters = parameters.split(' ');
                for (index in parameters) {
                    if (parameters[index] == '-c' || parameters[index] == '--clear') {
                        historyArray = [];
                        historyIndex = 0;
                    }
                }
                return "";
            } else {
                let commands = "<div class='common-text'>";
                for (let i = 0; i < historyArray.length; i++)
                    commands += i + " " + historyArray[i] + "<br />"
                return commands + "</div>";
            }
        },
        mkvar: (parameters) => {
            if (parameters) {
                parameters = parameters.split(' ');
                let name = "";
                let type = "";
                let val = "";
                for (index in parameters) {
                    if (parameters[index] == '-n' || parameters[index] == '--name') {
                        name = parameters[parseInt(index) + 1].trim();
                    } else if (parameters[index] == '-t' || parameters[index] == '--type') {
                        type = parameters[parseInt(index) + 1].trim();
                    } else if (parameters[index] == '-v' || parameters[index] == '--value') {
                        val = parameters[parseInt(index) + 1].trim();
                    }
                }
                if (name && type && val) {
                    switch (type.toLocaleLowerCase()) {
                        case "string": variables[name] = val;
                            break;
                        case "number": variables[name] = Number(val);
                            break;
                        case "boolean": variables[name] = ((val == 'true' || val == '1') ? true : false);
                            break;
                        default: return "<div class='common-text'>bash: il tipo inserito non è valido, usa il comand 'help -f mkvar' per saperne di più.</div>";
                    }
                    return "";
                }
            }
            return "<div class='common-text'>bash: il comando 'mkvar' richiede 3 argomenti in input, usa il comand 'help -f mkval' per saperne di più.</div>";
        },
        pwd: (parameters) => {
            if (parameters) {
                return "<div class='common-text'>bash: il comando 'pwd' non richiede parametri.</div>"
            } else {
                return "<div class='common-text'>/home/" + name + "</div>";
            }
        },
        rmvar: (parameters) => {
            if (parameters) {
                let response = "<div class='common-text'>";
                if (parameters) {
                    parameters = parameters.split(' ');
                    let message = "nomatch";
                    for (index in parameters) {
                        if (parameters[index] == '-a' || parameters[index] == '--all') {
                            variables = {};
                            message = "Tabella cancellata";
                        }
                        if (parameters[index] == '-n' || parameters[index] == '--name') {
                            name = parameters[parseInt(index) + 1].trim();
                            for (index in variables)
                                if (name && index == name) {
                                    delete variables[index];
                                    message = "Variabile cancellata";
                                }
                        }
                    }
                    return response + message + "</div>";
                }
            } else {
                return "<div class='common-text'>bash: il comando 'rmvar' necessita di almeno un parametro, usa il comand 'help -f rmvar' per saperne di più.</div>";
            }
        },
        swvar: (parameters) => {
            let table = "<div class='common-text'><table><tHead><tr><th>Nome</th><th>Tipo</th><th>Valore</th></tr><tHead><tBody>";
            if (parameters) {
                parameters = parameters.split(' ');
                let name = "";
                for (index in parameters) {
                    if (parameters[index] == '-n' || parameters[index] == '--name') {
                        name = parameters[parseInt(index) + 1].trim();
                    }
                }
                if (name) {
                    for (index in variables) {
                        if (name && index.includes(name))
                            table += "<tr><td>" + index + "</td><td>" + typeof variables[index] + "</td><td>" + variables[index] + "</td></tr>";
                    }
                    table += "</tBody></table></div>";
                } else {
                    return "<div class='common-text'>bash: il comando 'swvar' non è usato in maniera corretta, usa il comand 'help -f swvar' per saperne di più.</div>";
                }
            } else {
                for (index in variables) {
                    table += "<tr><td>" + index + "</td><td>" + typeof variables[index] + "</td><td>" + variables[index] + "</td></tr>";
                }
                table += "</tBody></table></div>"
            }
            return table;
        },
        whoami: (parameters) => {
            if (parameters) {
                return "<div class='common-text'>bash: il comando 'whoami' non richiede parametri.</div>"
            } else {
                return "<div class='common-text'>" + name + "</div>";
            }
        },

        // sum: (parameters)=>{
        //     if (parameters) {
        //         parameters = parameters.split(' ');
        //         if(parameters.length > 1){
        //             let sum = 0;
        //             for (index in parameters) {
        //                 if(variables[index])
        //                     sum += parseInt(variables[index];                        
        //             }
        //             return "<div class='common-text'>" + sum + "</div>";
        //         }           
        //     }
        //     return "<div class='common-text'>bash: il comando 'sum' richiede almeno due parametri, usa il comand 'help -f sum' per saperne di più.</div>";
        // },

        cd: (parameters) => { return fileSystemError() },
        cp: (parameters) => { return fileSystemError() },
        ls: (parameters) => { return fileSystemError() },
        mkdir: (parameters) => { return fileSystemError() },
        touch: (parameters) => { return fileSystemError() },
        rm: (parameters) => { return fileSystemError() },
        rmdir: (parameters) => { return fileSystemError() },
        webprogramming: (parameters) => { return "<div class='common-text'><div><pre>" + art1 + "</pre><br><br></div>bash: il comando 'webprogramming' non esiste! In compenso però esite un bel corso universitario :)</div>" },
        mario: () => { return "<div class='common-text'><pre>" + art + "</pre></div>"}
    }



    /* ***** funzioni principali ***** */

    function printResult(response, value = "") {
        document.getElementById("bash-container").insertAdjacentHTML('beforeend', response + commandRow(name, value));
        addEventListenerForCommandRow();
    }

    function autocomplete(input) {
        if (input.value.trim()) {
            let commands = [];
            for (command in commandsList)
                if (command.startsWith(input.value))
                    commands.push(command);
            if (commands.length == 1) {
                input.value = commands[0];
            } else if (commands.length > 1) {
                let response = "<div class='common-text'>";
                for (command of commands)
                    response += TAB + command + TAB;
                response += "</div>";
                input.disabled = true;
                printResult(response, input.value);
            }
        }
    }

    function processCommand(input) {
        tab = false;
        let response = "";
        input.disabled = true;
        if (input.value) {
            let text = input.value.toLowerCase().trim();
            if (text) {
                historyArray.push(text);
                historyIndex = historyArray.length;
                let command = text.split(' ', 1)[0].trim();
                let parameters = text.substring(text.indexOf(' ') + 1).trim();
                if (command in commandsFunctions) {
                    if (parameters != command)
                        response += commandsFunctions[command](parameters);
                    else
                        response += commandsFunctions[command]();
                } else {
                    response = `<div class='common-text'>
                                    bash: comando '` + command + `' non riconosciuto, inserisci il comando 'help' per ottenere una lista dei comandi.
                                </div>`;
                }
            }
        }
        printResult(response);
    }

    function setNameListener() {
        document.querySelectorAll(".custom-name-form").forEach(form => {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                if (this.elements['name'].value) {
                    name = this.elements['name'].value;
                    this.elements['name'].disabled = true;
                    printResult("");
                } else {
                    document.getElementById("bash-container").innerHTML += setName;
                    setNameListener();
                }
                setFocusCurrentInput();
            });
        });
    }

    function addEventListenerForCommandRow() {
        let input = document.querySelectorAll(".custom-command-input")
        input[input.length - 1].addEventListener('keydown', function (e) {
            switch (e.key) {
                case "Enter": processCommand(this);
                    break;
                case "ArrowUp": getOldCommand(this);
                    break;
                case "ArrowDown": getNextCommand(this);
                    break;
                case "Control": autocomplete(this);
                    break;
            }
            setFocusCurrentInput();
        });
    }

    document.addEventListener('DOMContentLoaded', (event) => {
        setNameListener();
    });

    var art = `
    ────────────────────────────────────────
    ──────────────────────▒████▒────────────
    ───────────────────░█████▓███░──────────
    ─────────────────░███▒░░░░░░██──────────
    ────────────────▒██▒░░░▒▓▓▓▒░██─────────
    ───────────────▓██░░░▒▓█▒▒▒▓▒▓█─────────
    ──────────────▓█▓─░▒▒▓█─────▓▓█░────────
    ─────────────▓█▒░▒▒▒▒█──▓▓▒▒─▓█▒────────
    ────────────▒█▒░▒▒▒▒▓▒─▒▓▒▓▓─▒█░────────
    ────────────█▓░▒▒▒▒▒▓░─▓▒──░░▒█░────────
    ───────────██░▒▒▒▒▒▒█──▓──░▓████████────
    ──────────░█▒▒▒▒▒▒▒▒▓░─█▓███▓▓▓▓██─█▓───
    ────────▒▓█▓▒▒▒▒▒▒▒▒▓███▓▓████▓▓██──█───
    ──────░███▓▒▒▒▒▓▒▒▒████▒▒░░──████░──██░─
    ──────██▒▒▒▒▒▒▒▒▒▓██▒────────▒██▓────▓█─
    ─────▓█▒▒▒▒▒▒▒▒▓█▓─────▓───▒░░▓──▓────▓█
    ─────██▒▓▒▒▒▒▒█▓──────▒█▓──▓█░▒──▒░────█
    ─────██▒▒▓▓▓▒█▓▓───░──▓██──▓█▓▓▓█▓─────█
    ─────▓█▒██▓▓█▒▒▓█─────░█▓──▒░───░█▓────█
    ─────░██▓───▓▓▒▒▓▓─────░─────────▒▒─░─░█
    ──────▓█──▒░─█▒▓█▓──▒───────░─░───█▒──█▒
    ───────█──░█░░█▓▒──▓██▒░─░─░─░─░░░█▒███─
    ───────█▒──▒▒──────▓██████▓─░░░░─▒██▓░──
    ───────▓█──────────░██▓▓▓██▒─░──░█▒─────
    ────────██▒─────░───░██▓▓▓██▓▒▒▓█▒──────
    ─────────░████▒──░───▒█▓▓▓▓▓████▓───────
    ────────▒▓██▓██▒──░───▓█████▓███────────
    ──────▒██▓░░░░▓█▓░────░█▒█▒─▒▓█▓────────
    ─────▓█▒░░▒▒▒▒▒▓███▓░──▓█▒─▒▓▓█─────────
    ────░█▒░▒████▓██▓▓▓██▒───░▓█▓█░─────────
    ────▓█▒▒█░─▒───▓█▓▓▓▓▓▓▒▒▓█▓█▓──────────
    ────▓█▒█░───────██▓▓▓▓▓█▓▓█▓██──────────
    ────▒█▓▓────────░██▓██▓▓▓▓▓▓▓▓█─────────
    ─────██░────▓▓────█░─█▓▓▓▓▓▓▓─▒█████────
    ─────██░───░──────▓░─▓▓▓▓▓▓▓█─▒█▒░▒██───
    ────▓█░▓░──▓▓────▒█░─█▓▓▓▓▓▓▓█▒─░░░▒██──
    ────█─▒██─░──────████▓▓▓▓▓▓▓█▓─░▒▒█▓▓█░─
    ───▓█─▓▒▓▒░░────▓█▓▓▓▓▓▓▓▓▓▓█░░▒▓█░──▒█─
    ───▒█░█▒▒█▒───░▓█▓▓▓▓▓▓▓▓▓▓█▓░▒▓▓──▓█▓█─
    ───█▓▒▓▒▒▓██████▓▓▓▓▓▓▓▓▓▓▓█▒▒▓▓─░█▓▒▒█░
    ───█░▓▓▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█▒▒▓─▒█▒▒▒▒█─
    ──▒█─█▒▒▒▓█▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▓─▒█▒▒▒▒██─
    ──▓█─█▒▒▒▒█▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█▒▓▒░█▒▒▒░▓█──
    ──▓█─█▒▓▒▒▓█▓▓▓▓▓▓▓▓▓▓▓▓▓█▓▒▓░▓░░░░▒█░──
    ──▒█─▓▓▓▓▒▓█▓▓▓▓▓▓▓▓█████▓▓▓▓▒▓░░─▒█▒───
    ───█▒▓▓▓▓▓▒▓██████████░░██▓█─▒█▓▒▓█░────
    ───▓█▒█▓▓▓▓▒▓██░─░▒░─────██▒░▓▓▓▒██─────
    ────████▓▓▓██░───────────▓█░▓▒░░▓█░─────
    ──────░█████░─────────────██▓─▒██░──────
    ───────────────────────────▓███▒────────`

    var art1 = ` 
    ##      ##  ########  ########      ########   ########    #######    ######    ########      ###     ##     ##  ##     ##  ####  ##    ##   ######        
    ##  ##  ##  ##        ##     ##     ##     ##  ##     ##  ##     ##  ##    ##   ##     ##    ## ##    ###   ###  ###   ###   ##   ###   ##  ##    ##           
    ##  ##  ##  ##        ##     ##     ##     ##  ##     ##  ##     ##  ##         ##     ##   ##   ##   #### ####  #### ####   ##   ####  ##  ##              
    ##  ##  ##  ######    ########      ########   ########   ##     ##  ##   ####  ########   ##     ##  ## ### ##  ## ### ##   ##   ## ## ##  ##   ####      
    ##  ##  ##  ##        ##     ##     ##         ##   ##    ##     ##  ##    ##   ##   ##    #########  ##  #  ##  ##  #  ##   ##   ##  ####  ##    ##       
    ##  ##  ##  ##        ##     ##     ##         ##    ##   ##     ##  ##    ##   ##    ##   ##     ##  ##     ##  ##     ##   ##   ##   ###  ##    ##       
     ###  ###   ########  ########      ##         ##     ##   #######    ######    ##     ##  ##     ##  ##     ##  ##     ##  ####  ##    ##   ######        
    `

})()