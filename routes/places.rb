get '/places.json' do
  require_logon_or_halt!
  places = get_places
  response['Content-Type'] = 'application/json'
  return places.to_json
end

get '/places.plist' do
  require_logon_or_halt!
  places = get_places
  return places.to_plist
end

get '/places' do
  require_logon_or_redirect!
  @places = get_places
  cs 'places'
  js 'places'
  erb :places
end

get '/place/:uid' do
  require_logon_or_halt!
  return [400, 'Invalid ID'] if (! params[:uid])
  uid = params[:uid]
  place = get_place(uid)
  response['Content-Type'] = 'application/json'
  return place.to_json
end

post '/place/update/:uid' do
  require_admin_logon_or_halt!

  # TJK
  return [400, "Net yet enabled in development."]

  return [400, 'Invalid ID'] if (! params[:uid])
  uid = params[:uid]
  place = @places[uid]
  return [400, 'Could not find that place.'] if (place.nil?)
  changes = []
  map_data = [params[:resource]['location'], params[:resource]['location_x'], params[:resource]['location_y']].join('.')
  changes = []
  changes.push([:replace, :info, map_data])
  if (update_place(place, changes))
    place = get_place(uid)
    response['Content-Type'] = 'application/json'  
    return place.to_json
  else
    return [400, "Could not update that room."]
  end
end
