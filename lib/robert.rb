require 'rubygems'
require 'date'
require 'json'
require 'logger'
require 'mime/types'
require 'net/http'
require 'net/https'
require 'net/ldap'
require 'pony'
require 'uri'

# Configuration

require_relative '../etc/config.rb'

# Libraries

Dir.glob("#{File.expand_path(File.dirname(__FILE__))}/../lib/lib_*.rb").each do |f|
  require f
end

# Logging

$logger = Logger.new($log_file)
$logger.formatter = proc do |severity, datetime, progname, msg|
  "#{severity}: #{msg}\n"
end
$logger.level = $log_level
$logger.info "Starting. Using #{ENV['RACK_ENV']} data. Rack Rack Rack."

# Messaging

def pony_express(params)
  return false unless params

  # TJK
  return false

  if (ENV['RACK_ENV'] == 'production')
    return Pony.mail(params)
  end
  params[:to] = $admin_email
  params.delete(:cc) if params[:cc]
  params.delete(:bcc) if params[:bcc]
  return Pony.mail(params)
end 

# Objects

class Hash
  def remove!(*keys)
    keys.each{|key| self.delete(key)}
    self
  end
  def remove(*keys)
    self.dup.remove!(*keys)
  end
  def except(which)
    self.tap{|h| h.delete(which)}
  end
end

def dm_dump_all(dm_object)
  a = dm_object.all
  a.each do |o|
    o.attributes.each do |k, v|
      puts "#{k}: #{v}"
    end
  end
end

def properties_match_fields(object, fields)
  identical = true
  fields.each do |key, val|
    if (object[key] != val)
      identical = false
      break
    end
  end
  return identical
end

# Progress

def progress_open(out = nil)
  if (out)
    $progress_out = out
  else
    $progress_out = STDOUT 
  end
  progress_send('Starting ...', 'p_open')
end

def progress_send(event_data, event_type = nil)
  return if (! $progress_out)
  if (event_type)
    $progress_out << "event: #{event_type}\ndata: #{event_data}\n\n"
  else
    $progress_out << "data: #{event_data}\n\n"
  end
end

def progress_close(url = nil)
  if (url)
    progress_send(url, 'p_close_go')
  else
    progress_send('Finished', 'p_close')
  end
  $progress_out = nil if ($progress_out)
end

def progress_close_go(url)
  progress_send(url, 'p_close_go')
  $progress_out = nil if ($progress_out)
end

# Image Tests

def data_is_png?(data)
  return data[0,3]=="\x89\x50\x4e"
end

def data_is_jpeg?(data)
  return data[0,3]=="\xff\xd8\xff"
end

def file_is_image?(filename)
  f = File.open(filename,'rb')  # rb means to read using binary
  data = f.read(9)              # magic numbers are up to 9 bytes
  f.close
  return (data_is_jpeg?(data) || data_is_png?(data))
end

def file_is_jpeg?(filename)
  f = File.open(filename,'rb')  # rb means to read using binary
  data = f.read(9)              # magic numbers are up to 9 bytes
  f.close
  return data_is_jpeg?(data)
end

def floating?(object)
  true if Float(object) rescue false
end

# Files

def prepend_file(line, file_path)
  sleep(4)
  temp_file_path = file_path + '.tmp'
  if (File.rename(file_path, temp_file_path))
    file = File.new(file_path, 'w')
    file.write line
    temp_file = File.open(temp_file_path, 'r+')
    temp_file.each_line { |line| file.write line }
    temp_file.close()
    file.close()
    File.delete(temp_file_path)
  else
    $logger.error "#{__method__.to_s} File Error"
  end
  return
end

def copy_to_public(tmp, dest_file)
  dst_path = "#{File.expand_path(File.dirname(__FILE__))}/public/avatars/#{dest_file}"
  if File.file?(dst_path)
    FileUtils.remove dst_path
  end
  FileUtils.chmod 0644, tmp.path
  FileUtils.move tmp.path, dst_path
end

def purge_avatars
  avatars_path = "#{File.expand_path(File.dirname(__FILE__))}/../public/avatars"
  avatars_tmp_path = "#{File.expand_path(File.dirname(__FILE__))}/../tmp/avatars"
  $logger.info "#{__method__.to_s} Deleting images in tmp/avatars"
  Dir.glob("#{avatars_tmp_path}/*.*").each do |f|
    File.delete(f)
  end
  people.each do |person|
    filepath = "#{avatars_path}/#{person.jpegphoto}"
    $logger.info "#{__method__.to_s} Moving #{person.jpegphoto} from public/avatars to tmp/avatars"
    FileUtils.move filepath, "#{avatars_tmp_path}/#{person.jpegphoto}"
  end
  $logger.info "#{__method__.to_s} Deleting remaining images in public/avatars"
  Dir.glob("#{avatars_path}/*.*").each do |f|
    File.delete(f)
  end
  $logger.info "#{__method__.to_s} Moving images in tmp/avatars to public/avatars"
  Dir.glob("#{avatars_tmp_path}/*.*").each do |f|
    FileUtils.move f, "#{avatars_path}"
  end
end

# Date and Time Formats

def date_serial(d)
  ds = Date.strptime(d, '%m/%d/%Y')
  lotus_epoch = Date.strptime('12/30/1899', '%m/%d/%Y')
  return (ds - lotus_epoch).to_i
end

def mdy_to_ymd(mdy)
  return nil if (! mdy)
  date = Date.strptime(mdy, '%m/%d/%Y')
  date_string.strftime("%Y-%d-%Y")
  return date_string
end

def ymd_to_mdy(ymd)
  return nil if (! ymd)
  date = Date.strptime(ymd, '%Y-%m-%d')
  date_string.strftime("%m/%d/%Y")
  return date_string
end

def milliseconds_to_datetime(ms)
  return nil if (! ms)
  # return DateTime.now if (! ms)
  return Time.at(ms.to_i / 1000).utc.to_datetime
end

def datetime_to_milliseconds(dt)
  return nil if (! dt)
  # dt = DateTime.now if (! dt)
  return dt.strftime('%Q')
end