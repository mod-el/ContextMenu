var contextMenuSelected = null;

Element.prototype.contextMenu = function(menu){
	this.oncontextmenu = function(event){
		event.preventDefault();
		contextMenuSelected = null;

		removeContextMenu();

		var contextMenu = document.createElement('div');
		contextMenu.id = 'context-menu';

		var c = 0;
		for(var label in menu){
			var child = document.createElement('div');
			child.innerHTML = label;
			child.id = 'context-menu-'+c;
			child.execute = menu[label];

			child.select = (function(c){
				return function(){
					if(contextMenuSelected!==null)
						_('context-menu-'+contextMenuSelected).deselect();

					this.addClass('selected');
					contextMenuSelected = parseInt(c);
				}
			})(c);

			c++;

			child.deselect = function(){
				this.removeClass('selected');
			}

			child.go = (function(el){
				return function(){
					this.execute.call(el);
					removeContextMenu();
				};
			})(this);

			child.addEventListener('mouseover', function(){
				this.select();
			}, false);

			child.addEventListener('click', function(){
				this.go();
			}, false);

			contextMenu.appendChild(child);
		}

		var coords = getMouseCoords(event);

		var top = coords.y-window.pageYOffset;
		var left = coords.x-window.pageXOffset;

		contextMenu.style.top = top+'px';
		contextMenu.style.left = left+'px';
		contextMenu.style.opacity = 0;

		document.body.appendChild(contextMenu);

		if(top+contextMenu.offsetHeight>window.innerHeight)
			top -= contextMenu.offsetHeight;
		if(left+contextMenu.offsetWidth>window.innerWidth)
			left -= contextMenu.offsetWidth;

		var oldWidth = contextMenu.offsetWidth+1;
		var oldHeight = contextMenu.offsetHeight+1;

		contextMenu.style.width = '0px';
		contextMenu.style.height = '0px';

		contextMenu.offsetWidth; // Reflow
		contextMenu.className = 'transitioning';

		contextMenu.style.width = oldWidth+'px';
		contextMenu.style.height = oldHeight+'px';
		contextMenu.style.top = top+'px';
		contextMenu.style.left = left+'px';
		contextMenu.style.opacity = 1;

		return false;
	}
};

function contextMenuMoveSelection(dir){
	var new_selected = 0;
	switch(dir){
		case '+':
			if(contextMenuSelected===null)
				new_selected = 0;
			else
				new_selected = contextMenuSelected+1;
			break;
		case '-':
			if(contextMenuSelected===null){
				new_selected = 0;
				while(_('context-menu-'+(new_selected+1)))
					new_selected++;
			}else
				new_selected = contextMenuSelected-1;
			break;
	}

	if(_('context-menu-'+new_selected))
		_('context-menu-'+new_selected).select();
}

window.addEventListener('keydown', function(event){
	var contextMenu = _('context-menu');
	if(!contextMenu)
		return true;

	switch(event.keyCode){
		case 13:
			if(_('context-menu-'+contextMenuSelected)){
				event.preventDefault();
				event.stopImmediatePropagation();
				_('context-menu-'+contextMenuSelected).go();
				return false;
			}
			break;
		case 27:
			event.preventDefault();
			event.stopImmediatePropagation();
			removeContextMenu();
			return false;
			break;
		case 38:
			contextMenuMoveSelection('-');
			event.preventDefault();
			event.stopImmediatePropagation();
			return false;
			break;
		case 40:
			contextMenuMoveSelection('+');
			event.preventDefault();
			event.stopImmediatePropagation();
			return false;
			break;
	}
});

window.addEventListener('scroll', function(){
	removeContextMenu();
});

window.addEventListener('load', function(){
	checkZkMenu();

	if (typeof MutationObserver !== 'undefined') {
		var observer = new MutationObserver(function (mutations) {
			checkZkMenu();
		});

		observer.observe(document.body, {"childList": true, "subtree": true});
	}
});

document.addEventListener('mousedown', function(event){
	if(_('context-menu')){
		var t = event.target;
		while(t.parentNode){
			if(t.id==='context-menu')
				return true;
			t = t.parentNode;
		}

		removeContextMenu();
	}
});

function removeContextMenu(){
	if(_('context-menu'))
		document.body.removeChild(_('context-menu'));
}

function checkZkMenu(){
	var elements = document.querySelectorAll('[data-context-menu]');
	for(var i in elements){
		if(!elements.hasOwnProperty(i))
			continue;
		if(elements[i].getAttribute('data-set-context-menu'))
			continue;
		eval('var menu = '+elements[i].getAttribute('data-context-menu')+';');
		elements[i].contextMenu(menu);
		elements[i].setAttribute('data-set-context-menu', '1');
	}
}