onPageLoad(function(){
	document.addEventListener("contextmenu", event => event.preventDefault());
	
	for (let el of q("#--sm-menu-edit-style").children){
		if (el.tagName == "BUTTON" && el.classList.contains("--sm-menu-edit-input-activate"))
			el.addEventListener("click", $activateStyle);
		else if (el.tagName == "INPUT" || el.tagName == "SELECT")
			el.addEventListener("change", $focusedStyle);
	}
});

let $docStruct = [
	{
		"id": "--t0",
		"children": [],
		"parent": null
	}
];

let $els = {
	"--t0": {
		"id": "--t0",
		"classList": [],
		"tagName": "p",
		"attributes": {},
		"style": {},
		"innerHTML": "Editable text"
	}
}
let $tIdCounter = 1;

let $actEl = null;
let $prevActEl = null;
const allowedEls = {
	"P": [],
	"H1": [],
	"H2": [],
	"H3": [],
	"H4": [],
	"H5": [],
	"H6": [],
	"IMG": ["src"],
	"A": ["href"],
	"HR": [],
	"DIV": []
};

$smMenuEditCollapsed = false;

const nonContentEditableEls = [
	"HR", "IMG", "DIV"
]

const innerHTMLable = [
	"DIV"
]

const dimensionStyles = [
	"font-size", "letter-spacing", "word-spacing",
	"margin", "padding", "width", "height"
]

const percentageStyles = [
	"opacity"
]

$openElement = function(toClose, toOpen, display = "block"){
	q(toClose).style.display = "none";
	q(toOpen).style.display = display;
}

$minimise = function(){
	let editMenu = q("#--sm-menu-edit");
	let state = Number(editMenu.dataset.state);
	if (!$smMenuEditCollapsed){
		$smMenuEditCollapsed = true;
		setTimeout(() => {
			if (!$smMenuEditCollapsed) return; 
			
			if (state == 1)
				$setMinimise(editMenu, 0);
			else
				$setMinimise(editMenu, 1);
			$smMenuEditCollapsed = false;
		}, 200);
	} else {
		$setMinimise(editMenu, 2);
		$smMenuEditCollapsed = false;
	}
}

$setMinimise = function(editMenu, state){
	let minCharacter = q("#--sm-meu-edit-minimise").children[0];
	switch (state){
		case 0:
			editMenu.dataset.state = "0";
			editMenu.className = "";
			minCharacter.innerText = "keyboard_arrow_down";
			break;
		case 1:
			editMenu.dataset.state = "1";
			editMenu.className = "--minimised";
			minCharacter.innerText = "keyboard_arrow_up";
			break;
		case 2:
			editMenu.dataset.state = "2";
			editMenu.className = "--collapsed";
			minCharacter.innerText = "keyboard_arrow_up";
			break;
	}
}

$changeSides = function(){
	//let menu = q("#--sm-menu");
	//if (menu.style.right == "1.5em"){
	//	menu.style.right = "";
	//	menu.style.left = "1.5em";
	//} else {
	//	menu.style.right = "1.5em";
	//	menu.style.left = "";
	//}
}

$findObjectById = function(id, parent = $docStruct){
	for (let object of parent){
		if (object["id"] == id)
			return object;
		if (Array.isArray(object["children"]) && object["children"].length > 0){
			let childrenResult = $findObjectById(id, object["children"]);
			if (childrenResult !== null) return childrenResult;
		}
	}
	return null;
}

$isDescendant = function(supposedParent){
	if (supposedParent == null || $actEl == null) return false;
	let currElObj = $findObjectById($actEl.id);
	while (currElObj.parent != null){
		if (currElObj.parent == supposedParent.id)
			return true;
		else currElObj = $findObjectById(currElObj.parent);
	} 
	return false;
}

$focusOnMe = function(event, toFocusOnEl = null){
	if ($isDescendant(event.currentTarget)) return; 

	q("#--sm-menu-new").style.display = "none";
	q("#--sm-menu-main").style.display = "none";
	q("#--sm-menu-edit").style.display = "flex";
	$prevActEl = $actEl;
	$actEl = event.currentTarget || toFocusOnEl || document.activeElement;

	for (let selected of qa(".--over-selected-el"))
		selected.classList.remove("--over-selected-el");
	$actEl.classList.add("--over-selected-el");

	if (innerHTMLable.includes($actEl.tagName.toUpperCase())){
		q("#--sm-menu-div-add").style.display = "flex";
	} else q("#--sm-menu-div-add").style.display = "none";

	q("#--sm-menu-edit-tag").innerText = $actEl.tagName;
	for (let attrEl of q("#--sm-menu-edit-attr").children){
		attrName = attrEl.id.split("-").at(-1);
		attrEl.style.display = (allowedEls[$actEl.tagName].includes(attrName)) ? "inline-block" : "none";
		if (attrEl.tagName == "INPUT")
			attrEl.value = $actEl.getAttribute(attrName) || "";
	}

	for (let styleEl of q("#--sm-menu-edit-style").children){
		if (styleEl.tagName != "INPUT" && styleEl.tagName != "SELECT") continue;

		if ($els[$actEl.id]["style"].hasOwnProperty(styleEl.id.substring(21))){			
			styleEl.value = $els[$actEl.id]["style"][styleEl.id.substring(21)];
		}
		else{
			yap(`${$actEl.id} does not have ${styleEl.id.substring(21)}; ${styleEl.tagName == "SELECT"}`);
			if (styleEl.tagName == "INPUT" && styleEl.type == "color")
				styleEl.value = "#000000";
			else if (styleEl.tagName == "SELECT")
				styleEl.value = "";
			else
				styleEl.value = null;
			if (styleEl.nextElementSibling == null || styleEl.nextElementSibling.tagName != "BUTTON")
				continue;
			styleEl.disabled = true;
			styleEl.nextElementSibling.classList.add("--on");
			styleEl.nextElementSibling.children[0].innerText = "visibility_off";
		}
	}

	let rect = $actEl.getBoundingClientRect();
	q("#--controls-drag").style.display = "flex";
	q("#--controls-drag").style.left = `calc(${rect.right}px - 2em)`;
	q("#--controls-drag").style.top = `calc(${rect.top}px - 2em)`;

	q("#--sm-menu-edit-id").innerText = $actEl.id || "ID";
}

$blurred = function(){
	for (let selected of qa(".--over-selected-el"))
		selected.classList.remove("--over-selected-el");

	q("#--controls-drag").style.display = "none";

	$prevActEl = $actEl;
	$actEl = null;

	q("#--sm-menu-new").style.display = "none";
	q("#--sm-menu-main").style.display = "block";
	q("#--sm-menu-edit").style.display = "none";
}

$textBlurred = function(blurredEl){
	if (isEmpty(blurredEl.innerText))
		blurredEl.innerText = "Editable text";
}

$activateTab = function(toClose, toOpen){
	q(toClose).classList.remove("--on");
	q(toOpen).classList.add("--on");
}

$focusedAttribute = function(field, attribute){
	let value = "";
	//let actElObj = $findObjectById($actEl.id);
	let staticActElId = $actEl.id;
	let actElObj = $els[staticActElId];
	field.blur();
	if (field.tagName == "INPUT") {
		value = field.value;
	}
	else {
		switch (attribute){
			case "id":
				if (isEmpty(field.innerText) || field.innerText.startsWith("-")){ 
					alert("Please enter a valid ID");
					field.innerText = staticActElId;
					break;
				}
				field.innerText = field.innerText.replace(/(\r\n|\n|\r)/gm, "");
				field.innerText = field.innerText.replaceAll(/\s/gm, "-");
				if (q(`#${field.innerText}`) != null){
					alert(`There's already an element with an ID "${field.innerText}"`); 
					field.innerText = staticActElId;
				}
				break;
		}
		value = field.innerText;
	}
	if (isEmpty(value)) value = $getDefaultValue(attribute);
	$actEl.setAttribute(attribute, value);

	if(attribute == "id"){
		if (staticActElId == value) return;
		actElObj.id = value;

		// Update IDs in $docStruct
		let actElStruct = $findObjectById(staticActElId);
		actElStruct["id"] = value;
		$els[value] = actElObj;
		delete $els[staticActElId];
	

		for (let child of actElStruct["children"]){
			child["parent"] = value;
		}
		
		if ($findObjectById(actElStruct["parent"]) != undefined){
			let parentsChildren = $findObjectById(actElStruct["parent"])["children"];
			parentsChildren[parentsChildren.indexOf(staticActElId)] = value;
		}
	} else {
		actElObj.attributes[attribute] = value;
	}
}

$focusedStyle = function(event){
	const field = event.currentTarget;
	let property = field.id.substring(21);
	field.blur();

	if (dimensionStyles.includes(property) && (!isNaN(field.value)) && !isEmpty(field.value))
		field.value += "px";

	if (percentageStyles.includes(property) && (!isNaN(field.value)) && !isEmpty(field.value))
		field.value += "%";

	$actEl.style.setProperty(property, field.value);

	if (!isEmpty(field.value))
		$els[$actEl.id]["style"][property] = field.value;
	else delete $els[$actEl.id]["style"][property];
}

$activateStyle = function(event){
	const button = event.currentTarget;
	const field = button.previousElementSibling;
	let value = field.value;
	let property = field.id.substring(21);
	state = field.disabled;
	field.disabled = !state;
	
	if (state){
		$actEl.style.setProperty(property, value);
		$els[$actEl.id]["style"][property] = value;
		button.classList.remove("--on");
		button.children[0].innerText = "visibility";
	} else {
		$actEl.style.removeProperty(property);
		delete $els[$actEl.id]["style"][property];
		button.classList.add("--on");
		button.children[0].innerText = "visibility_off";
	}
}

$getDefaultValue = function(attr){
	let tagName = $actEl.tagName;
	switch (attr){
		case "src":
			if (tagName == "IMG")
				return "images/blank_100x100.png"
			break;
	}
	return "null";
}

$newElement = function(tagName = null){
	tagName = tagName || q("#--sm-menu-new-input").value;
	q("#--sm-menu-new-input").value = null;
	if (allowedEls[tagName.toUpperCase()] == undefined) return;

	let parentEl = $actEl;

	let newEl = m(tagName);
	newEl.id = `--t${$tIdCounter++}`;
	if (!nonContentEditableEls.includes(tagName.toUpperCase())){
		newEl.contentEditable = true;
		newEl.innerText = "Click here to edit";
		newEl.addEventListener("blur", () => $textBlurred(newEl));
	} else{
		if (tagName == "img") newEl.src = "images/blank_100x100.png";
	} 
	newEl.addEventListener("click", $focusOnMe);
	
	let nodeObj = {
		"id": newEl.id,
		"classList": [],
		"tagName": tagName,
		"attributes": {},
		"style": {},
		"innerHTML": innerHTMLable.includes(tagName.toUpperCase()) ? [] : newEl.innerHTML
	};

	if (parentEl === null){
		q("#--site-body").appendChild(newEl);
		$els[newEl.id] = nodeObj;
		$docStruct.push({
			"id": newEl.id,
			"children": [],
			"parent": null
		});
	}
	else{
		parentEl.appendChild(newEl);
		$els[newEl.id] = nodeObj;
		$findObjectById(parentEl.id)["children"].push({
			"id": newEl.id,
			"children": [],
			"parent": parentEl.id
		});
	}

	$focusOnMe(new Event("click"), newEl);
}

exampleNodeObj = {
	"id": "--t0",
	"classList": ["big", "center-text"],
	"tagName": "IMG",
	"attributes": {
		"src": "images/blank_100x100.png"
	},
	"style": {
		"fontSize": "12px"
	},
	"innerHTML": []		//innerHTML either has string or array value
						//depending on the tagName
};