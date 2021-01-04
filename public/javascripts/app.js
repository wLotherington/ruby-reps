$(function() {
  const API = {
    logout: function() {
      $.ajax({
        url: '/logout',
        type: 'GET',
      }).done(function() {
        $(location).attr('href', '/');
      });
    },

    runScript: function(code, fields) {
      $.ajax({
        url: '/script',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({code: code}),
      }).done(function(data) {
        fields.forEach(field => field.setValue(data));
      });
    },

    runUserScript: function(code, field) {
      $.ajax({
        url: '/script',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({code: code}),
      }).done(function(data) {
        Reps.$submitButton.removeClass('disabled');
        field.setValue(data);
        Reps.checkAnswer();
      });
    },

    addCard: function(card) {
      $.ajax({
        url: '/cards',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(card),
      }).done(function(data) {
        CreateCards.clearSampleFields();
      });
    },

    getAllReps: function() {
      $.ajax({
        url: '/reps/all',
        type: 'GET',
        dataType: 'json',
      }).done(function(data) {
        Reps.parseCards(data);
        Reps.loadNextCard();
      });
    },
  };

  const UI = {
    $loginButton: $('#login'),
    $main: $('main'),

    promptLogout: function() {
      let username = this.$loginButton.text();
      
      this.loginButtonMode('prompt-logout');
      this.$loginButton.addClass('logout');

      let count = 5

      this.$loginButton.html('Logout ' + username + "? " + count);

      this.countDown = setInterval(() => {
        count--;
        this.$loginButton.html('Logout ' + username + "? " + count);

        if (count <=0 ) {
          clearInterval(this.countDown);
          this.$loginButton.html(username);
          this.$loginButton.data('mode', 'logged-in');
          this.$loginButton.removeClass('logout');
        }
      }, 1000);
    },

    loginButtonMode: function(mode) {
      if (!!mode) {
        this.$loginButton.data('mode', mode);
      }

      return this.$loginButton.data('mode');
    },

    addCodeMirrors: function() {
      this.cmCodes = [...document.getElementsByClassName('cm-code')].map(cmCode => {
        return CodeMirror(cmCode, {
          mode:  "ruby",
          theme: "monokai"
        });
      });

      this.cmReturns = [...document.getElementsByClassName('cm-return')].map(cmReturn => {
        return CodeMirror(cmReturn, {
          mode:  "none",
          readOnly: "nocursor",
          theme: "monokai"
        });
      });
    },

    init: function() {
    },
  };

  const Card = {
    setCategory: function() {
      if (!this.interval) {
        this.category = 'new';
      } else if (this.next_repetition_date <= new Date) {
        this.category = 'due';
      } else {
        this.category = 'done';
      }
    },

    init: function(data) {
      this.id = data['id'];
      this.prompt = data['prompt'];
      this.method = data['method'];
      this.starterCode = data['starter_code'];
      this.solutionCode = data['solution_code'];
      this.solutionReturnValue = data['solution_return_value'];
      this.interval = data['interval'];
      this.easiness_factor = data['easiness_factor'];
      this.next_repetition_date = data['next_repetition_date'];

      this.setCategory();

      return this;
    },
  };

  const Reps = {
    $buttons: $('.button'),
    $submitButton: $('.action-button'),
    $prompt: $('.prompt .content'),

    checkAnswer: function() {
      let sameAnswer = UI.cmReturns[0].getValue() === UI.cmReturns[1].getValue();
      let hasMethod = UI.cmCodes[0].getValue().indexOf(this.card['method'].trim()) !== -1;

      if (sameAnswer && hasMethod) {
        this.$buttons.removeClass('disabled');
        UI.cmCodes[1].setValue(this.card['solutionCode']);
      } else {
        this.$buttons.addClass('disabled');
        UI.cmCodes[1].setValue('');
      }
    },

    parseCards: function(data) {
      this.cards = data["reps"].map(rep => Object.create(Card).init(rep));
      this.newCards = this.cards.filter(card => card.category === 'new');
      this.dueCards = this.cards.filter(card => card.category === 'due');
      this.doneCards = this.cards.filter(card => card.category === 'done');
    },

    nextCard: function() {
      if (this.newCards.length > 0) {
        let idx = Math.floor(Math.random() * this.newCards.length);

        return this.newCards.splice(idx, 1)[0];
      } else if (this.dueCards.length > 0) {
        let idx = Math.floor(Math.random() * this.dueCards.length);

        return this.dueCards.splice(idx, 1)[0];
      } else {
        return false;
      }
    },

    loadNextCard: function() {
      this.card = this.nextCard();

      if (!!this.card) {
        this.$prompt.html(this.card['prompt']);
        UI.cmCodes[0].setValue(this.card['starterCode']);
        UI.cmReturns[1].setValue(this.card['solutionReturnValue']);
      } else {
        alert("You're done!")
      }
    },

    handleButtonClick: function(e) {
      e.preventDefault();
      let $button = $(e.target);

      if ($button.hasClass('disabled')) return;

      if ($button.hasClass('selected')) {
        $button.removeClass('selected');
        this.$submitButton.data('mode', 'run');
        this.$submitButton.text('Run')
      } else {
        this.$buttons.removeClass('selected');
        $button.addClass('selected');
        this.$submitButton.data('mode', 'next');
        this.$submitButton.text('Next')
      }
    },

    handleSubmitClick: function(e) {
      e.preventDefault();

      let mode = this.$submitButton.data('mode');

      if (mode === 'run') {
        let code = UI.cmCodes[0].getValue();
        let returnField = UI.cmReturns[0];
        this.$submitButton.addClass('disabled');
        API.runUserScript(code, returnField);
      }
    },

    bindEventListeners: function() {
      this.$buttons.on('click', e => this.handleButtonClick(e));
      this.$submitButton.on('click', e => this.handleSubmitClick(e));
    },

    init: function() {
      UI.addCodeMirrors();
      UI.cmCodes[1].setOption('readOnly', 'nocursor')
      this.cards = API.getAllReps();
      this.bindEventListeners();
    },
  };

  const CreateCards = {
    $buttons: $('button'),
    $prompt: $('textarea'),
    $maskedPrompt: $('.masked-prompt'),

    createStarterCode: function() {
      let codePieces = this.code.split('#');
      let starterCode = codePieces[0] + "# Enter code here" + (codePieces[2] || '');
      let solutionCode = codePieces[1];

      UI.cmCodes[1].setValue(starterCode);
    },

    createPrompt: function() {
      let promptPieces = this.$prompt.val().replace(/\n/g, '<br>').split('$');
      this.method = promptPieces[1];
      let prompt = '<span class="hide show">' + this.method + '</span>' + (promptPieces[2] || '')
      this.$maskedPrompt.html(prompt)
    },

    handleSubmitButton: function(e) {
      e.preventDefault();
      this.code = UI.cmCodes[0].getValue();

      API.runScript(this.code, UI.cmReturns);
      this.createStarterCode();
      this.createPrompt();
    },

    handleResetButton: function(e) {
      e.preventDefault();

      UI.cmReturns.forEach(cmReturn => cmReturn.setValue(''));
      UI.cmCodes.forEach(cmCode => cmCode.setValue(''));
      this.$prompt.val('Method: $$');
      this.$maskedPrompt.html('');
    },

    clearSampleFields: function() {
      UI.cmReturns[1].setValue('');
      UI.cmCodes[1].setValue('');
      this.$maskedPrompt.html('');
    },

    handleAddButton: function(e) {
      e.preventDefault();

      let card = {
        starterCode: UI.cmCodes[1].getValue(),
        solutionCode: UI.cmCodes[0].getValue().replace(/\n#/g, ''),
        method: this.method,
        prompt: this.$maskedPrompt.html().replace(" show", ''),
        solutionReturnValue: UI.cmReturns[0].getValue(),
      }

      API.addCard(card);
    },

    bindEventListeners: function() {
      this.$submitButton.on('click', e => this.handleSubmitButton(e));
      this.$resetButton.on('click', e => this.handleResetButton(e));
      this.$addButton.on('click', e => this.handleAddButton(e));
    },

    splitButtons: function() {
      this.$resetButton = this.$buttons.eq(0);
      this.$addButton = this.$buttons.eq(1);
      this.$submitButton = this.$buttons.eq(2);
    },

    init: function() {
      UI.addCodeMirrors();
      this.splitButtons();
      this.bindEventListeners();
    },
  };

  const App = {
    handleLoginButton: function(e) {
      if (UI.loginButtonMode() !== 'logged-out') {
        e.preventDefault();
      }

      if (UI.loginButtonMode() === 'logged-in') {
        UI.promptLogout();
      } else if (UI.loginButtonMode() == 'prompt-logout') {
        API.logout();
      }
    },

    bindEventListeners: function() {
      UI.$loginButton.on('click', e => this.handleLoginButton(e));
    },

    initializePage: function() {
      switch (this.page) {
        case '/reps':
          Reps.init();
          break;
        case '/cards/new':
          CreateCards.init();
          break;
      }
    },

    init: function() {
      this.page = window.location.pathname;
      this.initializePage();
      this.bindEventListeners();
    },
  };

  App.init();
});