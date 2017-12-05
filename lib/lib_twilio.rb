# require 'twilio-ruby'

# $twilio_account_phone_number  =
# $twilio_account_sid      =
# $twilio_account_authtoken    =

def generate_access_code
  code = rand(1111...9999)
  return code
end

def clear_access_code()
  session[:access_code] = nil
  return true
end

def save_access_code(code)
  session[:access_code] = code
  return true
end

def send_access_code(code, mobile)
  return false if (! code)
  return false if (! mobile)
  emoji_robot = "\u{1F916}"
  twilio_client = Twilio::REST::Client.new($twilio_account_sid, $twilio_account_authtoken)
  message = twilio_client.account.messages.create(
    :from => $twilio_account_phone_number,
    :to => mobile,
    :body => "#{emoji_robot} Puppet access code: #{code}",
  )
  # $logger.error "#{__method__.to_s} Access Code Error" if ...
  return !! message
end

def check_access_code(code)
  return false if (! code)
  return false if (! session[:access_code])
  return code == session[:access_code]
end
