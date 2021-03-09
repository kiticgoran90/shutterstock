import React from 'react'
import { Helmet } from 'react-helmet'

const Meta = ({ title, description, keywords }) => {
    return (
        <Helmet>
                <title>{title}</title>
                <meta name='description' content={description}></meta>
                <meta name='keywords' content={keywords}></meta>
        </Helmet> 
    )
}

Meta.defaultProps = {
    title: 'Welcome To Shutterstock',
    description: 'We sell best electronics',
    keywords: 'electronics, buy electronics'
}

export default Meta
