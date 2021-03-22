/* global $ */

let user = "none";

const M_DASH_HEX_CODE = "\u2014";
const BAD_DATA_BG_COLOR = "#FF3030";

const NAME_REG_EXP = /^[a-z ,.'-]+$/i;
const DATE_REG_EXP = /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/;
const YN_REG_EXP = /^[y,n]$/i;
const INTEGER_REG_EXP = /^\d+$/;
const MASSEY_ID_REG_EXP = /^\d{8}$/;
const EMAIL_REG_EXP = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
const TAGS_REG_EXP = /<\/?[^>]+(>|$)/g;
const FILE_REG_EXP = /^[\w,\s-]+\.[A-Za-z]{3}$/gm;

async function postJSON(endpoint, json) {

    json.user = user;
    try {
        const resp = await fetch(`/api/${endpoint}`, {
            method: "POST",
            body: JSON.stringify(json),
            headers: {
                "Content-Type": "application/json"
            }
        });
        if (!resp.ok) {
            throw new Error(`Bad HTTP status: ${resp.statusText} [${resp.status}]`);
        }
        return await resp.json();
    }
    catch (err) {
        console.log(`(fetch error) ${err.message}`);
        return {};
    }
}

function sortNumStr(array, key, forward = true) {
    console.log("Sorting number/string");
    return array.sort(function (a, b) {
        var x = a[key]; var y = b[key];
        if (forward) {
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        }
        else {
            return ((x > y) ? -1 : ((x < y) ? 1 : 0));
        }
    });
}

function sortDateStr(array, key, forward = true) {
    console.log("Sorting date");
    return array.sort(function (a, b) {
        var x = new Date(a[key]); var y = new Date(b[key]);
        if (forward) {
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        }
        else {
            return ((x > y) ? -1 : ((x < y) ? 1 : 0));
        }

    });
}

function setUser(usr) {
    user = usr;
}

function fadeOut(el) {
    el.style.opacity = 1;

    return new Promise(function (resolve) {
        (function fade() {
            if ((el.style.opacity -= .1) < 0) {
                el.style.display = "none";
                resolve();
            } else {
                requestAnimationFrame(fade);
            }
        })();
    });
}

function fadeIn(el, display) {
    el.style.opacity = 0;
    el.style.display = display || "block";

    return new Promise(function (resolve) {
        (function fade() {
            var val = parseFloat(el.style.opacity);
            if (!((val += .1) > 1)) {
                el.style.opacity = val;
                requestAnimationFrame(fade);
            }
            else {
                resolve();
            }
        })();
    });
}

function ready(callback) {
    if (document.readyState !== "loading") {
        callback();
    }
    else {
        document.addEventListener("DOMContentLoaded", callback);
    }
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

function validateFileName(str) {
    const ok = FILE_REG_EXP.test(str);
    const msg = ok ? "" : "Invalid file name";
    return { ok, msg };
}

function validateDateString(str, acceptEmpty = true) {
    if (acceptEmpty && str === "") {
        return {
            ok: true,
            msg: ""
        }
    }

    const ok = DATE_REG_EXP.test(str);
    const msg = ok ? "" : "Invalid date. Expected YYYY-MM-DD";
    return { ok, msg };
}

function validateName(str) {
    const ok = NAME_REG_EXP.test(str);
    const msg = ok ? "" : "Invalid name";
    return { ok, msg };
}

function validateYN(str) {
    const ok = YN_REG_EXP.test(str);
    const msg = ok ? "" : "Y or N expected";
    return { ok, msg };
}

function validateInteger(str) {
    const ok = INTEGER_REG_EXP.test(str);
    const msg = ok ? "" : "Integer expected";
    return { ok, msg };
}

function validateMasseyID(str) {
    const ok = MASSEY_ID_REG_EXP.test(str);
    const msg = ok ? "" : "8 digit integer expected";
    return { ok, msg };
}

function validateEmail(str) {
    const ok = EMAIL_REG_EXP.test(str);
    const msg = ok ? "" : "Invalid email address";
    return { ok, msg };
}

function validateFullTime(str) {
    const lower = str.toLowerCase();
    const ok = (lower === "ft") || (lower === "pt");
    const msg = ok ? "" : "FT or PT expected";
    return { ok, msg };
}

function validateText(str) {
    const ok = str.length < 256;
    const msg = ok ? "" : "Text too long.";
    return { ok, msg };
}

function validateCollege(str) {
    const lower = str.toLowerCase();
    const ok = (lower === "arts") || (lower === "science") || (lower === "health");
    const msg = ok ? "" : "Arts, Science or Health expected";
    return { ok, msg };
}

function validateInternal(str) {
    const lower = str.toLowerCase();
    const ok = (lower === "int") || (lower === "ext");
    const msg = ok ? "" : "<strong>int</strong> or <strong>ext</strong> expected";
    return { ok, msg };
}

/* function ipMdashClick(evt) {
    if (evt.currentTarget.innerText.trim() === M_DASH_HEX_CODE) {
        evt.currentTarget.innerText = "";
    }
} */

function ipMdashFocus(evt) {
    if (evt.currentTarget.innerText.trim() === M_DASH_HEX_CODE) {
        evt.currentTarget.innerText = "";
    }
}

function ipDateKeyUp(evt) {
    const text = evt.currentTarget.innerText.trim();

    if (validateDateString(text, true).ok) {
        evt.currentTarget.style.backgroundColor = "white";
    }
    else {
        evt.currentTarget.style.backgroundColor = BAD_DATA_BG_COLOR;
    }
}

function ipDateClick(evt) {
    console.log("ipDate click");
    const text = evt.currentTarget.innerText.trim();

    if (text === M_DASH_HEX_CODE || text === "") {
        evt.currentTarget.innerText = formatDate(new Date());
        evt.currentTarget.style.backgroundColor = "white";
    }
}

async function newStaff({ collapseID, updateDetails, saveBtn, span, firstName, lastName, internal, notes, staffTable }) {
    span.innerHTML = "&nbsp;";
    if (!lastName) {
        span.innerHTML = "<strong>A last name is required</span>";
        saveBtn.disabled = false;
        return;
    }
    if (!validateName(lastName).ok) {
        span.innerHTML = "<strong>Invalid last name</span>";
        saveBtn.disabled = false;
        return;
    }
    if (firstName && !validateName(firstName).ok) {
        span.innerHTML = "<strong>Invalid first name</span>";
        saveBtn.disabled = false;
        return;
    }
    if (internal && !validateInternal(internal).ok) {
        span.innerHTML = `Invalid internal: <strong>${validateInternal(internal).msg}</span>`;
        saveBtn.disabled = false;
        return;
    }
    if (notes && !validateText(notes).ok) {
        span.innerHTML = "<strong>Invalid notes</span>";
        saveBtn.disabled = false;
        return;
    }
    for (const staff of staffTable) {
        if (staff.lastName == lastName) {
            span.innerHTML = "<strong>Last name already exists</span>";
            saveBtn.disabled = false;
            return;
        }
    }
    const sql = `INSERT INTO staff (firstName, lastName, internal, notes) VALUES ("${firstName}","${lastName}","${internal.toUpperCase()}", "${notes}")`;
    console.log(sql);

    const resp = await postJSON("update", { sql });
    console.log(resp);
    staffTable = await postJSON("staff", { msg: "JSON from browser." });
    for (const staff of staffTable) {
        if (staff.pk == resp.id) {
            console.log("Found new entry:", staff);
            updateDetails(staff);
            break;
        }
    }
    saveBtn.disabled = false;
    $(collapseID).collapse("hide");
}

function getSelectTableHtml(items, nCols = 5) {
    let html = "";
    let state = "begin-row";
    let n = 0;
    let err = 0;
    let done = false;
    let degreeHTML = "";
    while (++err < 1000 && !done) {
        switch (state) {
            case "begin-row":
                html += "<tr>";
                state = "in-row"
                break;
            case "in-row":
                try {
                    degreeHTML = items[n].degreePK ? ` data-degreepk=${items[n].degreePK} ` : "";
                    html += `<td><button type="button" class="btn btn-light btn-sm" data-pk="${items[n].pk}" ${degreeHTML}>${items[n].data}</button></td>`;
                }
                catch (e) {
                    console.error(items[n]);
                }

                n++;
                /** If we are at the end of a row or have run out of items, end the row */
                if (n % nCols === 0 || n === items.length) {
                    state = "end-row";
                }
                break;
            case "end-row":
                html += "</tr>";
                /** If we still have more items left, begin a new row */
                if (n < items.length) {
                    state = "begin-row";
                }
                /** Otherwise we are done */
                else {
                    done = true;
                }
                break;
        }
    }
    if (!done) {
        html = "Select column state machine failed.";
    }

    return html;
}

function calculateGrade(m) {
    const mark = parseFloat(m);
    if (isNaN(mark)) {
        return "NaN";           // NaN = not a number
    }
    if (mark < 40) {
        return M_DASH_HEX_CODE; // Large hyphen symbol
    }
    if (mark < 50) {
        return "D";
    }
    if (mark < 55) {
        return "C-";
    }
    if (mark < 60) {
        return "C";
    }
    if (mark < 65) {
        return "C+";
    }
    if (mark < 70) {
        return "B-";
    }
    if (mark < 75) {
        return "B";
    }
    if (mark < 80) {
        return "B+";
    }
    if (mark < 85) {
        return "A-";
    }
    if (mark < 90) {
        return "A";
    }
    return "A+";
}

function download(filename, text) {
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function stripTags(str) {
    return typeof str === "string" ? str.replace(TAGS_REG_EXP, " ") : "";
}

export {
    fadeIn, fadeOut, ready, postJSON, setUser, sortNumStr, sortDateStr, formatDate,
    validateDateString, validateName, validateYN, validateInteger, validateMasseyID,
    validateEmail, validateFullTime, validateText, validateCollege, validateInternal,
    ipMdashFocus, ipDateKeyUp, ipDateClick, getSelectTableHtml, newStaff,
    calculateGrade, download, stripTags, validateFileName, 
    M_DASH_HEX_CODE, BAD_DATA_BG_COLOR
};