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
let items;
let zone;
let tab = 'welcome';
let welcome = $('#containerList')[0].innerHTML;
let activatedBefore;

let height1;
let height2;
let height3;
// Når serveren loader
$(document).ready(function() {
  window.addEventListener('message', function(event) {
    const data = event.data;
    if (data.type === 'esx_shop') {
      if (data.display === true) {
        setTab(welcome);
        tab = 'welcome';
        $('.window').show();
        $('#back').hide();
        items = data.items;
        zone = data.zone;
        if (!activatedBefore) {
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
          activatedBefore = true;
          const itemsHeight = (items.length * 43);
          height1 = (itemsHeight +  122);
          height2 = (itemsHeight);
          height3 = (itemsHeight - 1);
        }

        // Sætter højden af vinduet
        $('.window').height(height1);
        $('.main-container').height(height2);
        $('.shadow').height(height3);

        welcome = $('#containerList')[0].innerHTML;
      } else if (data.display === false) {
        $('.window').hide();
      }
    }
  });
});

function goBack() {
  setTab(welcome);
  $('#back').hide();
  $('.window').height(height1);
  $('.main-container').height(height2);
  $('.shadow').height(height3);
  tab = 'welcome';
}

$('#back').bind('click', goBack);

$('#containerList').on('click', 'li', function() {
  if (tab === 'welcome') {
    tab = 'specific';
    $('.window').height(395);
    $('.main-container').height(308);
    $('.shadow').height(270);
    $('#back').show();

    let amount = 1;
    let total;
    const item = items[parseInt($(this).attr('id'))];

    $('#containerList')[0].innerHTML = `
      <li class="menu-header">
        <div>
          <h1 class="noselect">${formatItem(item.item)}</h1>
        </div>
      </li>
      <div class="shadow"></div>
      <li style="text-align: center">
        <h2>Antal</h2>
      </li>
      <li>
        <div class="slidecontainer">
          <input type="range" min="1" max="100" value="1" class="slider" id="amountSlider">
        </div>
      </li>
      <li>
        <div class="info">
          <p><b>Vare:</b> ${formatItem(item.item)}</p>
          <p><b>Enkeltpris:</b> <span class="price">${formatPrice(item.price)}</span></p>
          <p id="amount"><b>Antal:</b> ${amount}</p>
          <p id="total"><b>Total:</b> <span class="price">${formatPrice(item.price * amount)}</span></p>
        </div>
      </li>
      <li>
        <div id="buy">
          <p class="noselect"><b>KØB</b></p>
        </div>
      </li>
    `;

    document.getElementById('amountSlider').oninput = function() {
      amount = this.value;
      total = item.price * amount;
      document.getElementById('amount').innerHTML = `<p id="amount"><b>Antal:</b> ${amount}</p>`;
      document.getElementById('total').innerHTML  = `<p id="total"><b>Total:</b> <span class="price">${formatPrice(item.price * amount)}</span></p>`;
    }

    $('#buy').bind('click', function() {
      $.post('http://esx_shops/buy', JSON.stringify({
        item: item.item,
        amount: parseInt(amount),
        zone: zone
      }));
      $.post('http://esx_shops/close', JSON.stringify({}));
    });
  }
});

// Luk menuen med "ESC" knappen på tasteturet
$(document).keyup(function (data) {
  if (data.which == 27) {
    closeMenu();
  } else if (data.which == 8) {
    goBack();
  }
});

// Luk menuen med "x" oppe in højre hjørne
$('.x-container').bind('click', function() {
  closeMenu();
});
