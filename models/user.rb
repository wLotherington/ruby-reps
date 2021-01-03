require 'bcrypt'

class User
  attr_reader :errors, :role, :invitation, :username, :password, :repassword, :save, :encrypted_password
  attr_accessor :id
  
  def initialize(params = nil, db = nil)
    @errors = []
    @admin_code = BCrypt::Password.new('$2a$12$dU/Nt6F2Rni1OsYuRa9bPOQl93pvnDX4zMmAnCRXTGGpRZhsypSOu')
    @invite_code = BCrypt::Password.new('$2a$12$kGq.EdwIJE3wWTfu8uh8XO/yqNXPVvuPOX.0G.xLhzR/pJw93mRiS')

    @db = db
    @invitation = ''
    @username = ''
    @password = ''
    @repassword = ''

    if !!params
      @invitation = params[:invitation]
      @username = params[:username]
      @password = params[:password]
      @repassword = params[:repassword]
    end
  end

  def save
    check_validations

    if @errors.empty?
      @encrypted_password = BCrypt::Password.create(@password)
      @role = determine_role

      @password = nil
      @repassword = nil
      @invitation = nil

      create
    else
      false
    end
  end

  def valid_login?
    user_params = @db.users_find_by_name(@username)

    if !!user_params && BCrypt::Password.new(user_params['password']) == @password
      @id = user_params['id']
      @role = user_params['role']
    else
      @errors.push('Invalid username or password')

      false
    end
  end

  private

  def create
    @db.users_create(self)
  end

  def check_validations
    validate_invitation
    validate_username_uniqueness
    validate_username_length
    validate_password_length
    validate_same_password
  end

  def validate_invitation
    #do make database backed
    unless (@admin_code == @invitation) || (@invite_code == @invitation)
      @errors.push('Invalid invitation code') 
    end
  end

  def validate_username_uniqueness
    username_exists = !!@db.users_find_by_name(@username)

    if username_exists
      @errors.push('Username already taken')
    end
  end

  def validate_username_length
    unless @username.length >= 3
      @errors.push('Username must be at least 3 characters')
    end
  end

  def validate_password_length
    unless @password.length >= 5
      @errors.push('Password must be at least 5 characters')
    end
  end

  def validate_same_password
    unless @password == @repassword
      @errors.push('Passwords do not match')
    end
  end

  def determine_role
    if @admin_code == @invitation
      'admin'
    elsif @invite_code == @invitation
      'user'
    else
      'invalid'
    end
  end
end