#### LDAP

def ldap_new_as_session_user
  ldap_auth = {:method => :simple, :username => "uid=#{session[:username]},#{$ldap_base}", :password => session[:xxxxxxxx]}
  ldap_conn = {:host => $ldap_host, :port => $ldap_port, :base => $ldap_base, :encryption => :simple_tls, :auth => ldap_auth}
  ldap = Net::LDAP.new(ldap_conn)
  return ldap
end

def ldap_authenticate(username, password)
  return false unless username
  return false unless password
  if (username.include? '@puppet.com')
    username.sub!(/\@puppet\.com$/, '')
  end
  ldap_auth = {:method => :simple, :username => "uid=#{username},#{$ldap_base}", :password => "#{password}"}
  ldap_conn = {:host => $ldap_host, :port => $ldap_port, :base => $ldap_base, :encryption => :simple_tls, :auth => ldap_auth}
  check = Net::LDAP.new(ldap_conn)
  filter = Net::LDAP::Filter.eq('uid', "#{username}")
  result = check.bind_as(:base => $ldap_base, :filter => filter, :password => "#{password}")

  if (result)
    $logger.info "#{__method__.to_s} Authentication succeeded for #{username}"
    return true
  else
    $logger.error "#{__method__.to_s} Authentication failed for #{username}"
    return false
  end
end

def ldap_authorize_admin(username)
  return false unless username
  if (username.include? '@puppet.com')
    username.sub!(/\@puppet\.com$/, '')
  end  
  ldap = Net::LDAP.new($ldap_conn)
  filter = Net::LDAP::Filter.eq('uid', "#{username}")
  attributes = ['memberOf']
  ldap.search(:base => $ldap_base, :filter => filter, :attributes => attributes) do |entry|
    if (entry.memberOf.include? 'cn=ldapadmins,ou=groups,dc=puppet,dc=com')
        $logger.info "#{__method__.to_s} Authentication succeeded for #{username}"
      return true
    end
  end
  $logger.error "#{__method__.to_s} Authentication failed for #{username}"
  return false
end

def get_ldap_response(ldap_object)
  if (ldap_object.get_operation_result.code != 0)
    $logger.error "#{__method__.to_s} Response Code: #{ldap_object.get_operation_result.code}, Message: #{ldap_object.get_operation_result.message}"
    return false
  end
  return true
end
