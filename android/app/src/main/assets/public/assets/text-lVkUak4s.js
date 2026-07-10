//#region src/utils/text.js
function truncateText(text, maxLength = 30) {
	if (!text) return "";
	if (text.length <= maxLength) return text;
	return text.slice(0, maxLength - 3) + "...";
}
//#endregion
export { truncateText as t };
