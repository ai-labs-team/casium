import React from 'react';

export default ({ data: { user, items } }) => (
  <div>
    <header>
      <nav className="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
        <a className="navbar-brand" href="#">Casium App</a>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item active">
              <a className="nav-link" href="#">Home</a>
            </li>
          </ul>
          <form className="form-inline mt-2 mt-md-0">
            <span className='badge badge-light'>{user.name} {'<'}{user.email}{'>'}</span>
          </form>
        </div>
      </nav>
    </header>

    <main role="main" style={{ marginTop: 100 }}>
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <ul>
              {items.map(item => (
                <li key={item.id}>{JSON.stringify(item)}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  </div>
);
