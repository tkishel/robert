get '/' do
  no_logon_required!
  js 'index'
  erb :index
end

get '/avatars/' do
  no_logon_required!
  send_file File.join(settings.public_folder, '_img/person.png')
end

get '/envy' do
  no_logon_required!
  content_type :text
  return JSON.pretty_generate(request.env)
end

get '/ping' do
  no_logon_required!
  return 'Hi'
end

get '/whoami' do
  require_logon_or_halt!
  response['Content-Type'] = 'application/json'  
  if (session[:admin])
    return session_user_accounts.merge(:admin => session[:admin]).to_json
  end
  return session_user_accounts.to_json
end
