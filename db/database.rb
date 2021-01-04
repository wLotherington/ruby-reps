require 'pg'

class DB
  def initialize
    @db = if Sinatra::Base.production?
            PG.connect(ENV['DATABASE_URL'])
          else
            PG.connect(dbname: "ruby_reps")
          end
  end

  def disconnect
    @db.close
  end

  # ---------- USERS ----------

  # users#index

  def users_create(user)
    sql = <<~SQL
            INSERT INTO users (username, role, password)
            VALUES ($1, $2, $3)
            RETURNING *
          SQL

    result = query(sql, user.username, user.role, user.encrypted_password)
    user.id = result.first['id']
    user
  end

  def users_find_by_name(username)
    sql = "SELECT * FROM users WHERE username=$1"
    user = query(sql, username).first
    
    user
  end

  # ---------- SESSION ----------

  # session#create

  # ---------- CARDS ----------

  # cards#index

  # cards#create
  def cards_create(card)
    sql = <<~SQL
            INSERT INTO cards (prompt, starter_code, solution_code, solution_return_value)
            VALUES ($1, $2, $3, $4)
            RETURNING *
          SQL

    result = query(sql, card['prompt'], card['starterCode'], card['solutionCode'], card['solutionReturnValue'])
    card['id'] = result.first['id']

    card
  end

  # cards#show
  
  # cards#update

  # cards#destroy

  # ---------- REPS ----------

  # reps#edit

  # reps#update

  # reps#script

  # ---------- INVITES ----------

  # invites#index

  #invites#create

  # invites#update

  private

  def query(statement, *params)
    @db.exec_params(statement, params)
  end

end