import React from 'react';

const SampleTable = ({ data }) => (
    <div className='sample_urls'>
        {data.length > 0 ? (
            <div className='table-container'>
                <table className='styled-table'>
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>Title</th>
                            <th>Groq Data</th>
                            <th>GPT Data</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((url, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{url.title}</td>
                                <td><pre>{url.GroqData}</pre></td>
                                <td><pre>{url.GPTData}</pre></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <p>No data available</p>
        )}
    </div>
);

export default SampleTable;
