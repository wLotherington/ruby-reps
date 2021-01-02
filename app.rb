require 'sinatra'
require 'sinatra/reloader'

# configure do
#   enable :sessions
# end

# helpers do
#   def logged_in?
#     !!session[:username]
#   end

#   def admin?
#     session[:user_role] == 'admin'
#   end
# end

# before do
#   @db = DB.new
# end

# after do
#   @db.disconnect
# end

# ---------- TOP LEVEL ----------

get '/' do
  #do home page
  erb :home
end

get '/instructions' do
  #do instruction page
  erb :instructions
end

get '/about' do
  #do about page
  erb :about
end

# ---------- USERS ----------

# users#index
get '/users' do
  #do user list
    # ADMIN ONLY
    # list all users
    # potentially allow chainging permissions
end

# users#new
get '/users/new' do
  #do registration page
end

# users#create
post '/users' do
  #do create new user
end

# ---------- SESSION ----------

# session#new
get '/login' do
  #do login page
  erb :login
end

# session#create
post '/login' do
  #do login
end

# session#destroy
get '/logout' do
  #do logout
end

# ---------- CARDS ----------

# cards#index
get '/cards' do
  #do card list
    # ADMIN ONLY?
end

# cards#new
get '/cards/new' do
  #do card creation page
    # ADMIN ONLY
end

# cards#create
post '/cards' do
  #do Create card
    # ADMIN ONLY
end

# cards#show
get 'cards/:id' do
  #do load card page
    # ADMIN ONLY
end

# cards#edit
get 'cards/:id/edit' do
  #do edit card page
    # ADMIN ONLY
end

# cards#update
put '/cards/:id' do
  #do update card info
    # ADMIN ONLY
end

# cards#destroy
delete '/cards/:id' do
  #do delete card
    # ADMIN ONLY
end

# ---------- REPS ----------

# reps#edit
get 'reps/:id/edit' do
  #do show rep page
end

# reps#update
put '/reps/:id' do
  #do update rep record
end

# reps#script
post '/script' do
  #do run user code
end

# ---------- INVITES ----------

# invites#index
get '/invites' do
  #do show all invites
    # ADMIN ONLY
    # show which users used each one
    # show expiration date
end

# invites#new
get '/invites/new' do
  #do create new invite form
    # ADMIN ONLY
    # invite key
    # expiration date
end

#invites#create
post '/invites' do
  #do create new invite code record
    # ADMIN ONLY
end

# invites#edit
get '/invites/:id/edit' do
  #do invite edit page
    # ADMIN ONLY
end

# invites#update
put '/invites/:id' do
  #do update invite
end
