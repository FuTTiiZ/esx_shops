// Laver en funktion til at lukke menuen
function closeMenu() {
  setActive($('#' + tab), false);
  setTab(welcome);
  tab = 'welcome';
  $.post('http://esx_shops/close', JSON.stringify({}));
}

function formatPrice(price, kr) {
  return (!kr ? price.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + ' kr.' : price.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.'));
}

function formatItem(itemName) {
  let output;
  for (var i = 0; i < itemName.length; i++) {
    if (i === 0) {
      output = itemName.charAt(i).toUpperCase();
    } else {
      output += itemName.charAt(i);
    }
  }
  return output;
}

function setActive(e, on) {
  if (on) {
    let cur = e.attr('class');
    e.attr('class', cur += ' clicked');
  } else if (!on) {
    let cur = e.attr('class');
    if (cur) {
      let newC = cur.replace('clicked', '');
      e.attr('class', newC);
    }
  }
}

function setTab(page) {
  $('#containerList')[0].innerHTML = page;
}

function remove(array, element) {
  const index = array.indexOf(element);

  if (index > -1) {
    array.splice(index, 1);
  }
}

// Laver variabler
let tab = 'welcome';
const welcome = $('#containerList')[0].innerHTML;
const specific = ``;

// Når serveren loader
$(document).ready(function() {
  window.addEventListener('message', function(event) {
    const data = event.data;
    if (data.type === 'esx_shop') {
      if (data.display === true) {
        setTab(welcome);
        $('.window').show();
        $('#back').hide();
        const items = data.items;

        for (var i = 0; i < items.length; i++) {
          let item = items[i];
          $('#containerList')[0].innerHTML += `
            <li id="${i}" class="shop-item">
              <div>
                <p>
                  <b>${formatItem(item.item)}:</b> <span class="price">${formatPrice(item.price)}</span>
                </p>
              </div>
            </li>`;
        }

        // Sætter højden af vinduet
        const itemsHeight = (items.length * 43);
        $('.window').height(itemsHeight +  122);
        $('.main-container').height(itemsHeight);
        $('.shadow').height(itemsHeight - 1);
      } else if (data.display === false) {
        $('.window').hide();
      }
    }
  });
});

$('#containerList').on('click', 'li', function() {

});

// Luk menuen med "ESC" knappen på tasteturet
$(document).keyup(function (data) {
  if (data.which == 27) {
    closeMenu();
  }
});

// Luk menuen med "x" oppe in højre hjørne
$('.x-container').bind('click', function() {
  closeMenu();
});
