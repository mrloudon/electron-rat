
// eslint-disable-next-line no-unused-vars
const Utility = (function () {

    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
        }
        else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    }

    return { ready };
}());