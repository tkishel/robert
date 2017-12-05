def get_places
  places = []

  # TJK
  return places

  ldap = ldap_new_as_session_user()
  ldap.bind
  base = 'ou=places,dc=puppet,dc=com'
  filter = Net::LDAP::Filter.eq('objectclass', 'puppetRoom')
  attributes = ['uid', 'description']
  entries = ldap.search(:base => base, :attributes => attributes, :filter => filter, :return_result => true)
  entries.sort! { |a,b| a.uid[0].downcase <=> b.uid[0].downcase }
  entries.each do |entry|
    progress_send("Reading #{place['uid']}")
    place = entry_to_place(entry)
    places.push(place)
  end
  return places
end

def get_place(uid)
  place = {}

  # TJK
  return place

  ldap = ldap_new_as_session_user()
  ldap.bind
  uid_filter = Net::LDAP::Filter.eq('uid', uid)
  group_filter = Net::LDAP::Filter.eq('objectclass', 'puppetRoom')
  filter = Net::LDAP::Filter.join(user_filter, group_filter)
  attributes = ['uid', 'description']
  entries = ldap.search(:base => $ldap_base, :attributes => attributes, :filter => filter, :return_result => true)
  entries.sort! { |a,b| a.uid[0].downcase <=> b.uid[0].downcase }
  entries.each do |entry|
    place = entry_to_place(entry)
  end
  return place
end

def entry_to_place(entry)
  place = {}
  place['uid']         = entry['uid'][0]
  place['description'] = entry['description'][0]
  person['location']   = 'PDX-5'    # TJK
  person['location_x'] = 2200       # TJK
  person['location_y'] = 150        # TJK
  person['office']     = 'Portland' # TJK
  return place
end

def update_place(place, changes)
  return false unless place
  return false unless changes

  # TJK
  return true

  # ldap = ldap_new_as_session_user()
  # ldap.modify(:dn => place.dn, :operations => changes)
  # return get_ldap_response(ldap)
end
