### Robert 1.0

```
# Development Tools:

xcode-select --install
curl -L https://get.rvm.io | bash -s stable
source ~/.rvm/scripts/rvm
rvm install --with-gcc=clang
```

```
# Libraries:

gem install bundler --no-rdoc --no-ri
gem install logger --no-rdoc --no-ri
gem install mime-types --no-rdoc --no-ri
gem install net-ldap --no-rdoc --no-ri
gem install pony --no-rdoc --no-ri
gem install rack --no-rdoc --no-ri -v 1.6.8
gem install rake --no-rdoc --no-ri
gem install require_relative --no-rdoc --no-ri
gem install rerun --no-rdoc --no-ri
gem install sinatra --no-rdoc --no-ri -v 1.4.8
gem install thin --no-rdoc --no-ri
```

```
Test:

git clone https://github.com/tkishel/robert.git
cd robert
echo "You need to obtain a copy of etc/config.rb out-of-band!"
rackup -s thin config.ru
```
