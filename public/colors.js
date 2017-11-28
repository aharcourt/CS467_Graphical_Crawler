/* global window */
function colorScopingFunction() {
    const COLORS = [ // several colors generated randomly at http://phrogz.net/css/distinct-colors.html
        "#80407b",
        "#53a674",
        "#9886b3",
        "#2d86b3",
        "#608020",
        "#5353a6",
        "#59adb3",
        "#862db3",
        "#2d2080",
        "#a65b29",
        "#b25965",
        "#69818c",
        "#b39886",
        "#b22d2d",
        "#8c7723",
        "#b0b386",
        "#3eb32d"
    ];
    window.Hercules.KEYWORD_COLOR = "yellow";
    let colorMap = {};
    let currentColor = 0;

    window.Hercules.getColorForHost = function getColorForHost(host) {
        if (!colorMap[host]) {
            colorMap[host] = COLORS[currentColor];
            currentColor = (currentColor + 1) % COLORS.length;
        }
        return colorMap[host];
    };
}
colorScopingFunction();
