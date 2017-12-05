def get_people
  people = []
  ldap = ldap_new_as_session_user()
  ldap.bind
  employee_filter = Net::LDAP::Filter.eq('employeenumber', '*')
  group_filter = Net::LDAP::Filter.eq('objectclass', 'puppetPerson')
  filter = Net::LDAP::Filter.join(employee_filter, group_filter)
  attributes = person_attributes()
  entries = ldap.search(:base => $ldap_base, :attributes => attributes, :filter => filter, :return_result => true)
  return people unless entries
  entries.sort! { |a,b| a.uid[0].downcase <=> b.uid[0].downcase }
  entries.each do |entry|
    next unless entry['cn'][0]
    progress_send("Reading #{entry['uid']}")
    person = entry_to_person(entry)
    people.push(person)
  end
  return people
end

def get_person(uid)
  person = {}
  ldap = ldap_new_as_session_user()
  ldap.bind
  uid_filter = Net::LDAP::Filter.eq('uid', uid)
  group_filter = Net::LDAP::Filter.eq('objectclass', 'puppetPerson')
  filter = Net::LDAP::Filter.join(uid_filter, group_filter)
  attributes = person_attributes()
  entries = ldap.search(:base => $ldap_base, :attributes => attributes, :filter => filter, :return_result => true)
  return person unless entries
  entries.sort! { |a,b| a.uid[0].downcase <=> b.uid[0].downcase }
  entries.each do |entry|
    person = entry_to_person(entry)
  end
  return person
end

def update_person(person, changes)
  return false unless person
  return false unless changes
  
  # TJK
  return true

  # ldap = ldap_new_as_session_user()
  # ldap.modify(:dn => person.dn, :operations => changes)
  # return get_ldap_response(ldap)
end

def entry_to_person(entry)
  person = {}
  person['uid']                 = entry['uid'][0]
  person['bribemewith']         = entry['bribemewith'][0]
  person['cn']                  = entry['cn'][0]
  person['dietaryrestrictions'] = entry['dietaryrestrictions'][0]
  person['github']              = entry['github'][0]
  person['givenname']           = entry['givenname'][0]
  person['interestingfact']     = entry['interestingfact'][0]
  person['ircnickname']         = entry['ircnickname'][0]
  person['jpegphoto']           = ''                            # TJK
  person['jpegphotofile']       = "#{person['uid']}.jpg"        # TJK
  person['languages']           = entry['languages'].join(', ')
  person['location_x']          = 2200                          # TJK
  person['location_y']          = 150                           # TJK
  person['location']            = 'PDX-5'                       # TJK
  person['mail']                = entry['mail'][0]
  person['manager']             = entry['manager'][0]
  person['mobile']              = entry['mobile'][0]
  person['office']              = entry['physicaldeliveryofficename'][0]
  person['orgteam']             = entry['orgteam'].join(', ')
  person['ou']                  = entry['ou'][0]
  person['personaltitle']       = entry['personaltitle'][0]
  person['projects']            = entry['projects'].join(', ')
  person['pseudonym']           = entry['pseudonym'][0]
  person['shirtsize']           = entry['shirtsize'][0]
  person['skills']              = entry['skills'].join(', ')
  person['sn']                  = entry['sn'][0]
  person['startdate']           = entry['startdate'][0].to_s[0..7]
  person['title']               = entry['title'][0]
  person['twiterhandle']        = entry['twiterhandle'][0]
  #
  person['office']              = person['office'] == 'Headquarters' ? 'Portland' : person['office']
  #
  return person
end

def person_attributes
  return [
    'uid',
    'bribemewith',
    'cn',
    'dietaryrestrictions',
    'github',
    'givenname',
    'interestingfact',
    'ircnickname',
    # 'jpegphoto',
    'languages',
    # 'location',
    # 'location_x',
    # 'location_y',
    'mail',
    'manager',
    'mobile',
    'orgteam',
    'ou',
    'personaltitle',
    'physicaldeliveryofficename',
    'projects',
    'pseudonym',
    'shirtsize',
    'skills',
    'sn',
    'startdate',
    'title',
    'twiterhandle'
  ]
end
