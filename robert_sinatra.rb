require 'rubygems'
require 'sinatra'
require 'rack'

set :bind, '0.0.0.0'

configure do
  require_relative 'lib/robert.rb'
  use Rack::Session::Cookie, :key => 'rack.session', :path => '/', :secret => 'lovesongs', :expire_after => 172800
end

# Helpers --------------------------------------------------------------------------------

# http://www.sitepoint.com/using-sinatra-helpers-to-clean-up-your-code/

helpers do
  def partial(page, options={})
    @options = options
    erb page, options.merge!(:layout => false)
  end

  def local_path
    "#{File.expand_path(File.dirname(__FILE__))}"
  end

  # js :backbone, 'index', ...

  def js *scripts
    @js ||= []
    @js = scripts
  end

  def cs *sheets
    @cs ||= []
    @cs = sheets
  end

  def javascripts(*args)
    js = []
    js << settings.javascripts if settings.respond_to?('javascripts')
    js << args
    js << @js if @js
    js.flatten.uniq.map do |script|
      url = path_to_script(script)
      "<script type=\"text/javascript\" src=\"#{url}\"></script>\n"
    end.join
  end

  def stylesheets(*args)
    cs = []
    cs << settings.stylesheets if settings.respond_to?('stylesheets')
    cs << args
    cs << @cs if @cs
    cs.flatten.uniq.map do |css|
      url = path_to_style(css)
      "<link rel=\"stylesheet\" href=\"#{url}\">\n"
    end.join
  end

  def path_to_script script
    case script
      when :backbone then 'https://cdnjs.cloudflare.com/ajax/libs/backbone.js/0.9.0/backbone-min.js'
      when :jquery then 'https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js'
      when :jquery_iu then 'https://code.jquery.com/ui/1.7.1/jquery-ui.js"'
      else '/' + script.to_s + '.js'
    end
  end

  def path_to_style style
    case style
      when :jquery_iu then 'https://code.jquery.com/ui/1.7.1/themes/smoothness/jquery-ui.css'
      else '/' + style.to_s + '.css'
    end
  end

  def no_logon_required!
    return
  end  

  def require_admin_logon_or_halt!
    if (session[:admin] == true)
      return
    else
      $logger.error "#{__method__.to_s} Not Logged On as aAdmin"
      halt [400, 'Not Logged On as Admin']
    end
  end

  def require_admin_logon_or_return_json_false!
    if (session[:admin] == true)
      return
    else
      $logger.error "#{__method__.to_s} Not Logged On as Admin"
      response['Content-Type'] = 'application/json'  
      return {logged_in: false}.to_json
    end
  end

  def require_admin_logon_or_redirect!
    if (session[:admin] == true)
      return
    else
      $logger.error "#{__method__.to_s} Not Logged On as Admin"
      redirect '/?show_login=true'
    end
  end

  def require_logon_or_halt!
    if (session[:username])
      return
    else
      $logger.error "#{__method__.to_s} Not Logged On"
      halt [400, 'Not Logged On']
    end
  end

  def require_logon_or_return_json_false!
    if (session[:username])
      return
    else
      $logger.error "#{__method__.to_s} Not Logged On"
      response['Content-Type'] = 'application/json'  
      return {logged_in: false}.to_json
    end
  end

  def require_logon_or_redirect!
    if (session[:username])
      return
    else
      $logger.error "#{__method__.to_s} Not Logged On"
      redirect '/?show_login=true'
    end
  end

end

# Routes ---------------------------------------------------------------------------------

Dir.glob("#{File.expand_path(File.dirname(__FILE__))}/routes/*.rb").each do |f|
  require f
end

# Login ----------------------------------------------------------------------------------

post '/login' do
  authenticated = ldap_authenticate(params[:username], params[:password])
  if (authenticated)
    session[:logged_in] = true
    session[:username] = params[:username]
    session[:xxxxxxxx] = params[:password]
    session[:admin] = false # ldap_authorize_admin(params[:username])
  else
    session[:logged_in] = false
    session[:username] = nil
    session[:xxxxxxxx] = nil
    session[:admin] = false
  end
  response['Content-Type'] = 'application/json'
  return {logged_in: session[:logged_in]}.to_json
end

get '/login' do
  if (! session[:logged_in])
    session[:logged_in] = false
  end
  response['Content-Type'] = 'application/json'  
  return {logged_in: session[:logged_in]}.to_json
end

post '/logout' do
  if (session[:logged_in] == true)
    session[:logged_in] = nil
    session[:username] = nil
    session[:xxxxxxxx] = nil
    session[:admin] = nil
  end
  response['Content-Type'] = 'application/json'  
  return {logged_in: false}.to_json
end