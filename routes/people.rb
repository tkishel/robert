get '/people.json' do
  require_logon_or_halt!
  people = get_people
  response['Content-Type'] = 'application/json'
  return people.to_json
end

get '/people.plist' do
  require_logon_or_halt!
  people = get_people
  return people.to_plist
end

get '/people' do
  require_logon_or_redirect!
  @people = get_people
  cs 'people'
  js 'people', 'dropzone'
  erb :people
end

get '/person/:uid' do
  require_logon_or_halt!
  return [400, 'Invalid ID'] if (! params[:uid])
  uid = params[:uid]
  person = get_person(uid)
  response['Content-Type'] = 'application/json'  
  return person.to_json
end

post '/person/update/:uid' do
  require_admin_logon_or_halt!

  # TJK
  return [400, "Net yet enabled in development."]

  return [400, 'Invalid ID'] if (! params[:uid])
  uid = params[:uid]
  person = @people[:uid]
  return [400, 'Could not find that person.'] if (person.nil?)
  map_data = [params[:user]['location'], params[:user]['location_x'], params[:user]['location_y']].join('.')
  changes = []
  changes.push([:replace, :info, map_data])
  if (update_person(person, changes))
    person = get_person(uid)
    response['Content-Type'] = 'application/json'  
    return person.to_json
  else
    return [400, "Could not update that person."]
  end
end

post '/person/upload_photo/:uid' do
  require_admin_logon_or_halt!

  # TJK
  return [400, "Net yet enabled in development."]

  return [400, 'Invalid ID'] if (! params[:uid])
  uid = params[:uid]
  person = @people[:uid]
  return [400, 'Could not find that person.'] if (person.nil?)
  return [400, 'Invalid Photo'] if (! params[:photo_upload])
  jpeg = file_is_jpeg?(params[:photo_upload][:tempfile])
  if (jpeg)
    image = "#{params[:uid]}.jpg"
  else 
    image = "#{params[:uid]}.png"
  end  
  copy_to_public params[:photo_upload][:tempfile], image
  changes = []
  changes.push([:replace, :jpegphoto, image])
  if (update_person(person, changes))
    person = @people[:uid]
    response['Content-Type'] = 'application/json'  
    return person.to_json
  else
    return [400, 'Error: could not update that person.']
  end
end
