$(document).ready(function() {
  let activeProfile = 'profile'; 
  
  if ($('#authorFields').children().length === 0) {
    addAuthor();
  }

  function addAuthor(authorData = {}) {
    const template = document.getElementById('authorTemplate');
    const authorElement = document.importNode(template.content, true);
    const authorIndex = $('#authorFields').children().length + 1;
    
    $(authorElement).find('.author-number').text(authorIndex);
    
    const authorContainer = $(authorElement).find('.author');
    authorContainer.attr('data-author-index', authorIndex);
    
    if (authorData) {
      $(authorElement).find('.author-email').val(authorData.email || '');
      $(authorElement).find('.author-name').val(authorData.name || '');
      $(authorElement).find('.author-surname').val(authorData.surname || '');
      $(authorElement).find('.author-organization').val(authorData.organization || '');
      $(authorElement).find('.author-country').val(authorData.country || '');
    }
    
    $('#authorFields').append(authorElement);
    
    updateAuthorNumbers();
  }
  
  function updateAuthorNumbers() {
    $('.author').each(function(index) {
      $(this).attr('data-author-index', index + 1);
      $(this).find('.author-number').text(index + 1);
    });
  }

  $('#addAuthor').on('click', function() {
    addAuthor();
  });
  
  $('#authorFields').on('click', '.remove-author', function() {
    const authorCount = $('.author').length;
   
    if (authorCount > 1) {
      $(this).closest('.author').remove();
      updateAuthorNumbers();
    } else {
      alert('Enter at least one author details.');
    }
  });
  
  $('#saveAuthors').on('click', function() {
    const authors = [];
    
    $('.author').each(function() {
      authors.push({
        email: $(this).find('.author-email').val(),
        name: $(this).find('.author-name').val(),
        surname: $(this).find('.author-surname').val(),
        organization: $(this).find('.author-organization').val(),
        country: $(this).find('.author-country').val(),
      });
    });
    
    chrome.storage.sync.set({ [activeProfile]: authors }, function() {
      alert(`Authors saved to ${activeProfile}!`);
    });
  });

  function loadProfile(profile) {
    chrome.storage.sync.get([profile], function(result) {
      
      $('#authorFields').empty();
      
      if (result[profile] && result[profile].length > 0) {
        
        result[profile].forEach(function(author) {
          addAuthor(author);
        });
        console.log(`Loaded ${profile}`);
      } else {
        
        console.log(`No saved authors found for your ${profile}`);
        addAuthor();
      }
    });
  }
  
  $('.profile-button').on('click', function() {
    activeProfile = $(this).data('profile');
    loadProfile(activeProfile);
    
    $('.profile-button').removeClass('active');
    $(this).addClass('active');
  });
  
  $('#autoFillAuthors').on('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'autoFillAuthors', profile: activeProfile });
    });
  });
  
  loadProfile(activeProfile);
  
  $(`.profile-button[data-profile="${activeProfile}"]`).addClass('active');
});