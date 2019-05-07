ESX             = nil
local ShopItems = {}
local hasSqlRun = false

TriggerEvent('esx:getSharedObject', function(obj) ESX = obj end)

-- Load items
AddEventHandler('onMySQLReady', function()
	hasSqlRun = true
	LoadShop()
end)

-- extremely useful when restarting script mid-game
Citizen.CreateThread(function()
	Citizen.Wait(2000) -- hopefully enough for connection to the SQL server

	if not hasSqlRun then
		LoadShop()
		hasSqlRun = true
	end
end)

function LoadShop()
	local itemResult = MySQL.Sync.fetchAll('SELECT * FROM items')
	local shopResult = MySQL.Sync.fetchAll('SELECT * FROM shops')

	local itemInformation = {}
	for i=1, #itemResult, 1 do

		if itemInformation[itemResult[i].name] == nil then
			itemInformation[itemResult[i].name] = {}
		end

		itemInformation[itemResult[i].name].label = itemResult[i].label
		itemInformation[itemResult[i].name].limit = itemResult[i].limit
	end

	for i=1, #shopResult, 1 do
		if ShopItems[shopResult[i].store] == nil then
			ShopItems[shopResult[i].store] = {}
		end

		if itemInformation[shopResult[i].item].limit == -1 then
			itemInformation[shopResult[i].item].limit = 30
		end

		table.insert(ShopItems[shopResult[i].store], {
			label = itemInformation[shopResult[i].item].label,
			item  = shopResult[i].item,
			price = shopResult[i].price,
			limit = itemInformation[shopResult[i].item].limit
		})
	end
end

ESX.RegisterServerCallback('esx_shops:requestDBItems', function(source, cb)
	if not hasSqlRun then
		TriggerClientEvent('esx:showNotification', source, 'The shop database has not been loaded yet, try again in a few moments.')
	end

	cb(ShopItems)
end)

RegisterServerEvent('esx_shops:buyItem')
AddEventHandler('esx_shops:buyItem', function(itemName, amount, zone)
	local _source = source
	local xPlayer = ESX.GetPlayerFromId(_source)
	local sourceItem = xPlayer.getInventoryItem(itemName)

	amount = ESX.Round(amount)

	-- is the player trying to exploit?
	if amount < 0 then
		print('esx_shops: ' .. xPlayer.identifier .. ' attempted to exploit the shop!')
		return
	end

	-- get price
	local price = 0
	local itemLabel = ''

	for i=1, #ShopItems[zone], 1 do
		if ShopItems[zone][i].item == itemName then
			price = ShopItems[zone][i].price
			itemLabel = ShopItems[zone][i].label
			break
		end
	end

	price = price * amount

	-- can the player afford this item?
	if xPlayer.getMoney() >= price then
		-- can the player carry the said amount of x item?
		if sourceItem.limit ~= -1 and (sourceItem.count + amount) > sourceItem.limit then
			TriggerClientEvent("pNotify:SendNotification", _source, {
				text = "<h3><center>NetGaming Butik</center></h3><br><p>Du kan ikke holde mere</p>",
				type = "error",
				timeout = 5000,
				layout = "topRight",
				queue = "global"
			  })
		else
			xPlayer.removeMoney(price)
			xPlayer.addInventoryItem(itemName, amount)
			TriggerClientEvent("pNotify:SendNotification", _source, {
				text = "<h3><center>NetGaming Butik</center></h3><br><p>Du købte "..itemLabel.." x"..amount.." for <b style='color:green;'>DKK</b> "..price.."</p>",
				type = "info",
				timeout = 5000,
				layout = "topRight",
				queue = "global"
			  })
		end
	else
		local missingMoney = price - xPlayer.getMoney()
		TriggerClientEvent("pNotify:SendNotification", _source, {
			text = "<h3><center>NetGaming Butik</center></h3><br><p>Du har ikke nok penge! Du mangler <b style='color:green;'>DKK</b> "..missingMoney.."</p>",
			type = "info",
			timeout = 5000,
			layout = "topRight",
			queue = "global"
		  })
	end
end)