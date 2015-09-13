title: Entity - Edit
----
<form class="form-horizontal">
  <div class="form-group">
    <label for="entity-name" class="col-sm-3 control-label">Nom de votre organisation</label>
    <div class="col-sm-9">
      <input type="text" class="form-control" placeholder="Tapez le nom de votre organisation" autofocus="autofocus" id="entity-name" name="name" />  
    </div>
  </div>
  <div class="form-group">
    <label for="entity-id" class="col-sm-3 control-label">Identifiant de votre organisation</label>
    <div class="col-sm-9">
      <input type="text" class="form-control" placeholder="Tapez l'identifiant de votre organisation" id="entity-id" name="id" />
    </div>
  </div>
  <div class="form-group">
    <label for="entity-email" class="col-sm-3 control-label">Adresse e-mail de contact</label>
    <div class="col-sm-9">
      <input type="email" class="form-control" placeholder="Saisissez une adresse e-mail de contact" id="entity-email" name="email" />
    </div>
  </div>
  <div class="form-group">
    <label for="entity-description" class="col-sm-3 control-label">Description de votre organisation</label>
    <div class="col-sm-9">
      <textarea name="description" id="entity-description"
        placeholder="Description de votre organisation limitée à 250 caractères maximum"
        class="form-control"
        rows="10"
        cols="80"
        style="width:100%"></textarea>
    </div>
  </div>  
  
  <div class="form-group">
    <label for="entity-category" class="col-sm-3 control-label">Choisissez une catégorie / un type d’organisation</label>
    <div class="col-sm-9">
        <select class="form-control" id="entity-category" name="category" placeholder="Catégorie">
            <option selected>Entreprise</option>
            <option>Tiers-lieu</option>
            <option>Incubateur</option>
            <option>Investisseur</option>
            <option>Communauté</option>
            <option>Ecole</option>
            <option>Acteur public</option>
        </select>
    </div>
  </div>
  
  <div class="form-group">
    <label for="entity-tag" class="col-sm-3 control-label">Tags</label>
    <div class="col-sm-9">
      <input type="text" class="form-control" placeholder="Saisissez un tag" id="entity-tag" name="tag" />
      <input type="text" class="form-control" placeholder="Saisissez un tag" name="tag" />
      <input type="text" class="form-control" placeholder="Saisissez un tag" name="tag" />
      <input type="text" class="form-control" placeholder="Saisissez un tag" name="tag" />
      <input type="text" class="form-control" placeholder="Saisissez un tag" name="tag" />
    </div>
  </div>
  
  <div class="form-group">
    <label for="entity-address" class="col-sm-3 control-label">N° et nom de rue</label>
    <div class="col-sm-9">
      <input type="text" class="form-control" placeholder="N° et nom de rue" id="entity-address" name="address" />
    </div>
  </div>

  <div class="form-group">
    <label for="entity-postcode" class="col-sm-3 control-label">Code postal</label>
    <div class="col-sm-9">
      <input type="text" class="form-control" placeholder="Code postal" id="entity-postcode" name="postcode" />
    </div>
  </div>
  
  <div class="form-group">
    <label for="entity-city" class="col-sm-3 control-label">Ville</label>
    <div class="col-sm-9">
      <input type="text" class="form-control" placeholder="Ville" id="entity-city" name="city" />
    </div>
  </div>
  
  <div class="form-group">
    <label class="col-sm-3 control-label">Coordinates</label>
    <div class="col-sm-4">
      <label for="entity-coord-lat">Latitude</label>
      <input type="text" class="form-control" id="entity-coord-lat" name="coordinates.lat" placeholder="Latitude" />
    </div>
    <div class="col-sm-4">
      <label for="entity-coord-lng">Longitude</label>
      <input type="text" class="form-control" id="entity-coord-lng" name="coordinates.lng" placeholder="Longitude" />
    </div>
  </div>

  <div class="form-group">
    <label for="entity-creationyear" class="col-sm-3 control-label">Année de création</label>
    <div class="col-sm-9">
      <input type="text" class="form-control" placeholder="Année de création" id="entity-creationyear" name="creationyear" />
    </div>
  </div>
  
  <div class="form-group">
    <label for="entity-url" class="col-sm-3 control-label">Site Web</label>
    <div class="col-sm-9">
      <input type="text" class="form-control" placeholder="Saisissez l'URL du site web de votre organisation" id="entity-url" name="url" />
    </div>
  </div>

  <div class="form-group">
    <label for="entity-twitter" class="col-sm-3 control-label">Compte Twitter</label>
    <div class="col-sm-9">
      <input type="text" class="form-control" placeholder="Saisissez le nom du compte Twitter de votre organisation" id="entity-twitter" name="twitter" />
    </div>
  </div>
    

  <div class="form-group">
    <label for="entity-facebook" class="col-sm-3 control-label">Page Facebook</label>
    <div class="col-sm-9">
      <input type="text" class="form-control" placeholder="Saisissez l'URL de la page Facebook de votre organisation" id="entity-facebook" name="facebook" />
    </div>
  </div>
    

  <div class="form-group">
    <label for="entity-googleplus" class="col-sm-3 control-label">Page Google+</label>
    <div class="col-sm-9">
      <input type="email" class="form-control" placeholder="Saisissez l'URL de la page Google+ de votre organisation" id="entity-googleplus" name="googleplus" />
    </div>
  </div>


  <div class="form-group">
    <label for="entity-linkedin" class="col-sm-3 control-label">Page LinkedIn</label>
    <div class="col-sm-9">
      <input type="text" class="form-control" placeholder="Saisissez l'URL de la page LinkedIn de votre organisation" id="entity-linkedin" name="linkedin" />
    </div>
  </div>
    

  <div class="form-group">
    <label for="entity-viadeo" class="col-sm-3 control-label">Page Viadeo</label>
    <div class="col-sm-9">
      <input type="text" class="form-control" placeholder="Saisissez l'URL de la page Viadeo de votre organisation" id="entity-viadeo" name="viadeo" />
    </div>
  </div>
    
  
  
</form>

